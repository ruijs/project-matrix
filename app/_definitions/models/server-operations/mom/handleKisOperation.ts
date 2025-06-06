import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import { KisConfig, MomInspectionSheet, MomInventoryApplication, MomInventoryOperation } from "~/_definitions/meta/entity-types";
import KisInventoryOperationAPI, { WarehouseEntry } from "~/sdk/kis/inventory";
import { getNowString } from "~/utils/time-utils";
import KisHelper from "~/sdk/kis/helper";
import dayjs from "dayjs";
import EventLogService from "rapid-plugins/eventLog/services/EventLogService";
import { CreateEventLogInput } from "rapid-plugins/eventLog/EventLogPluginTypes";
import { KisApiResult } from "~/sdk/kis/api";
import { formatDateTime } from "@ruiapp/rapid-extension";

export type CreateGoodTransferInput = {
  operationId: number;
};

export default {
  code: "fix",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: CreateGoodTransferInput = ctx.input;

    await handleKisOperation(server, routeContext, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

export async function handleKisOperation(server: IRpdServer, routeContext: RouteContext, input: CreateGoodTransferInput) {
  const logger = server.getLogger();
  const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");
  const inventoryApplicationManager = server.getEntityManager<MomInventoryApplication>("mom_inventory_application");

  const kisApi = await new KisHelper(server).NewAPIClient(server.getLogger());
  const kisOperationApi = new KisInventoryOperationAPI(kisApi);

  const inventoryOperation = await inventoryOperationManager.findEntity({
    routeContext,
    filters: [
      {
        operator: "eq",
        field: "id",
        value: input.operationId,
      },
    ],
    properties: [
      "id",
      "code",
      "application",
      "warehouse",
      "operationType",
      "businessType",
      "contractNum",
      "supplier",
      "customer",
      "externalCode",
      "createdBy",
      "state",
      "approvalState",
    ],
  });

  if (!inventoryOperation) {
    logger.error(`Inventory operation with id ${input.operationId} was not found.`);
    return;
  }

  if (inventoryOperation.externalCode) {
    logger.warn(`库存操作单已同步至KIS，单号：${inventoryOperation.externalCode}`);
    return;
  }

  if (inventoryOperation?.businessType?.name === "采购入库") {
    return;
  }

  const inventoryApplication = await inventoryApplicationManager.findEntity({
    routeContext,
    filters: [
      {
        operator: "eq",
        field: "id",
        value: inventoryOperation?.application?.id,
      },
    ],
    properties: [
      "id",
      "applicant",
      "supplier",
      "externalCode",
      "code",
      "contractNum",
      "customer",
      "businessType",
      "from",
      "to",
      "operationType",
      "createdBy",
      "biller",
      "fFManager",
      "fSManager",
      "fUse",
      "fPlanSn",
      "fPOStyle",
      "fSupplyID",
      "items",
      "fDeliveryCode",
      "express",
      "depositDate",
    ],
    relations: {
      department: {
        properties: ["id", "name", "code", "externalCode"],
      },
    },
  });

  if (!inventoryApplication) {
    throw new Error(`Inventory application with id ${inventoryOperation?.application?.id} not found.`);
  }

  if (inventoryOperation.state === "done") {
    let externalEntityTypeName = "";
    let kisRequest: any = null;

    const kisConfig = await server.getEntityManager<KisConfig>("kis_config").findEntity({ routeContext });

    if (kisConfig) {
      // transfer aggregate, sum quantity by material and lotnum and location
      const transfers = await server.queryDatabaseObject(
        `
SELECT mai.material_id,
       mai.lot_num,
       bm.code                     AS material_code,
       bm.external_code            AS material_external_code,
       bu.external_code            AS unit_external_code,
       max(mai.inspect_state)      AS inspect_state,
       max(bl.manufacture_date)    AS manufacture_date,
       max(bl.qualification_state) AS qualification_state,
       sum(mai.quantity)           AS must_quantity,
       max(mai.accept_quantity)    as quantity,
       max(mai.remark)             AS remark
FROM mom_inventory_application_items mai
         inner join base_materials bm on mai.material_id = bm.id
         inner join base_units bu on bm.default_unit_id = bu.id
         left join base_lots bl on mai.material_id = bl.material_id and mai.lot_num = bl.lot_num
WHERE mai.operation_id = $1
group by mai.material_id, mai.lot_num, bm.code, bm.external_code, bu.external_code;
        `,
        [inventoryApplication.id],
        routeContext.getDbTransactionClient(),
      );

      if (inventoryOperation.approvalState === "approved") {
        let entries: WarehouseEntry[] = [];
        const warehouseId = parseInt(inventoryApplication?.to?.externalCode || inventoryApplication?.from?.externalCode || "", 10);
        if (isNaN(warehouseId)) {
          throw new Error("无法获取仓库信息。");
        }

        const inspectionSheet = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "inventory_operation_id",
              value: inventoryOperation?.id,
            },
          ],
          properties: ["id", "inspector"],
        });

        let kisResponse: KisApiResult | undefined;

        let locationCode = 0;
        const warehouse = inventoryApplication?.to || inventoryApplication?.from;
        switch (warehouse?.name) {
          case "原料库":
            locationCode = 1320;
            break;
          case "成品库":
            locationCode = 1321;
            break;
          case "包材库":
            locationCode = 2;
            break;
          case "次品库":
            locationCode = 4;
            break;
          case "周转库":
            locationCode = 5;
            break;
          case "外租仓库":
            locationCode = 0;
            break;
          default:
            break;
        }

        const departmentId = inventoryApplication?.department?.externalCode;

        if (inventoryOperation?.businessType?.operationType === "in") {
          // TODO: 生成KIS入库单
          switch (inventoryOperation?.businessType?.name) {
            // case "采购入库":
            //   externalEntityTypeName = "外购入库";
            //   const allInspected = transfers.every((transfer) => transfer?.inspect_state);
            //   if (!allInspected) {
            //     console.log("All items must be inspected before creating a purchase receipt.");
            //     return;
            //   }
            //   for (const transfer of transfers) {
            //     if (transfer?.qualification_state && transfer.qualification_state === "qualified") {
            //       entries.push({
            //         FItemID: parseInt(transfer.material_external_code, 10),
            //         FQty: parseFloat(transfer.quantity.toFixed(2)),
            //         Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
            //         FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
            //         FDCSPID: locationCode,
            //         FDCStockID: warehouseId,
            //         FBatchNo: transfer.lot_num,
            //         FUnitID: parseInt(transfer.unit_external_code, 10),
            //         // FMTONo: transfer.lot_num,
            //         // FSecQty: transfer.quantity,
            //         // FSecCoefficient: 1,
            //         // FAuxPrice: 1,
            //         FPlanMode: 14036,
            //         Fnote: transfer.remark,
            //       });
            //     }
            //   }

            //   if (entries.length > 0) {
            //     kisRequest = {
            //       Object: {
            //         Head: {
            //           Fdate: getNowString(),
            //           // FDCStockID: warehouseId,
            //           FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
            //           FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
            //           FBillerID: inventoryApplication?.biller?.externalUserCode,
            //           FTranType: 1,
            //           FPOStyle: inventoryApplication.fPOStyle,
            //           FSupplyID: inventoryApplication.fSupplyID,
            //           FHeadSelfA0143: inspectionSheet?.inspector?.externalCode,
            //           FDeptID: departmentId || "769",
            //           FROB: 1,
            //         },
            //         Entry: entries,
            //       },
            //     };
            //     kisResponse = await kisOperationApi.createPurchaseReceipt(kisRequest);
            //   }
            //   break;
            case "生产入库":
              externalEntityTypeName = "产品入库";
              for (const transfer of transfers) {
                entries.push({
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FMTONo: transfer.lot_num,
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    FDeptID: departmentId || "778",
                    // FDCStockID: warehouseId,
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 2,
                    FROB: 1,
                    FHeadSelfA0143: inspectionSheet?.inspector?.externalCode || "3286",
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createProductReceipt(kisRequest);
              break;
            case "委外加工入库":
              externalEntityTypeName = "委外加工入库";
              for (const transfer of transfers) {
                entries.push({
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  // FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FMTONo: transfer.lot_num,
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    // FDCStockID: warehouseId,
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 1,
                    FSupplyID: inventoryApplication?.supplier?.externalCode || inventoryApplication?.fSupplyID,
                    FHeadSelfA0143: "3286",
                    FPurposeID: 14190,
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createSubcontractReceipt(kisRequest);
              break;
            case "生产退料入库":
              externalEntityTypeName = "生产领料红字";
              for (const transfer of transfers) {
                entries.push({
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCSPID: locationCode,
                  FSCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FMTONo: transfer.lot_num,
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  FReProduceType: 1059,
                  Fnote: transfer.remark,
                });
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    // FSCStockID: warehouseId,
                    FPurposeID: 12000,
                    FDeptID: departmentId || "778",
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 24,
                    FROB: -1,
                    Fuse: inventoryApplication.fUse || "",
                    FHeadSelfB0436: inventoryApplication.fPlanSn || "无",
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createPickingList(kisRequest);
              break;
            case "销售退货入库":
              externalEntityTypeName = "销售出库红字";
              transfers.forEach((transfer, idx) => {
                let entity: any = {
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  FSourceTranType: "81",
                  FSourceInterId: inventoryApplication?.externalCode,
                  FSourceBillNo: inventoryApplication?.code,
                  FSourceEntryID: idx + 1,
                  FOrderBillNo: inventoryApplication?.code,
                  FOrderInterID: inventoryApplication?.externalCode,
                  FOrderEntryID: idx + 1,
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                };

                if (locationCode !== 0) {
                  entity.FDCSPID = locationCode;
                }

                entries.push(entity);
              });

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FEmpID: inventoryApplication?.applicant?.externalCode,
                    FTranType: 21,
                    FDeptID: departmentId || "781",
                    FROB: -1,
                    FHeadSelfB0164: inventoryApplication.express?.externalCode || "",
                    FHeadSelfB0163: inventoryApplication.contractNum || "无",
                    FHeadSelfB0165: inventoryApplication.fDeliveryCode || "无",
                    FMarketingStyle: "12530",
                    FSaleStyle: "102",
                    FSupplyID: inventoryApplication.customer?.externalCode,
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createSalesDelivery(kisRequest);
              break;
            case "其它原因入库":
              externalEntityTypeName = "其他入库";
              for (const transfer of transfers) {
                entries.push({
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    FDCStockID: warehouseId,
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 1,
                    FSupplyID: inventoryApplication?.fSupplyID,
                    FHeadSelfA0143: "3286",
                    FDeptID: departmentId || "783",
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createMiscellaneousReceipt(kisRequest);
              break;
            case "其它原因出库退货入库":
              externalEntityTypeName = "其他出库红字";
              for (const transfer of transfers) {
                let entity: any = {
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  Fnote: transfer.remark,
                  FPlanMode: 14036,
                };

                if (locationCode !== 0) {
                  entity.FDCSPID = locationCode;
                }

                entries.push(entity);
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    // FSCStockID: warehouseId,
                    FFManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 29,
                    FDeptID: departmentId || "783",
                    Fuse: inventoryApplication.fUse || "",
                    FROB: -1,
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createMiscellaneousDelivery(kisRequest);
              break;
            default:
              break;
          }
        } else if (inventoryOperation.operationType === "out") {
          switch (inventoryOperation?.businessType?.name) {
            case "销售出库":
              if (!inventoryApplication.depositDate) {
                throw new Error("销售出库单的出库日期不能为空。");
              }

              if (!inventoryApplication.externalCode) {
                throw new Error("源单内码不能为空。");
              }

              externalEntityTypeName = "销售出库";
              transfers.forEach((transfer, idx) => {
                const entryId = idx + 1;
                let entity: any = {
                  FEntryID: entryId,
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  FSourceTranType: 81,
                  FSourceInterId: parseInt(inventoryApplication.externalCode!, 10),
                  FSourceBillNo: inventoryApplication.code,
                  FSourceEntryID: 0, // idx + 1,
                  FOrderBillNo: inventoryApplication.code,
                  FOrderInterID: parseInt(inventoryApplication.externalCode!, 10),
                  FOrderEntryID: 0, // idx + 1,
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                  // 财务要求：使用出库日期作为生产日期
                  FEntrySelfB0170: dayjs(inventoryApplication.depositDate).format("YYYY-MM-DDT00:00:00"),
                  // fix: 公式计算异常：不能除以 0 。Calculate->FEntrySelfB0168->FEntrySelfB0168=Fauxqty/FEntrySelfB0169
                  FEntrySelfB0169: 1,
                };

                if (locationCode !== 0) {
                  entity.FDCSPID = locationCode;
                }

                entries.push(entity);
              });

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: dayjs(inventoryApplication.depositDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FEmpID: inventoryApplication?.applicant?.externalCode,
                    FTranType: 21,
                    FDeptID: departmentId || "781",
                    FROB: 1,
                    FHeadSelfB0164: inventoryApplication.express?.externalCode || "",
                    FHeadSelfB0163: inventoryApplication.contractNum || "无",
                    FHeadSelfB0165: inventoryApplication.fDeliveryCode || "无",
                    FMarketingStyle: "12530",
                    FSaleStyle: "102",
                    FSupplyID: inventoryApplication.customer?.externalCode,
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createSalesDelivery(kisRequest);
              break;
            case "委外加工出库":
              externalEntityTypeName = "委外加工出库";
              for (const transfer of transfers) {
                entries.push({
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    // FDCStockID: warehouseId,
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 28,
                    FPurposeID: 14190,
                    FSupplyID: inventoryApplication?.supplier?.externalCode || inventoryApplication?.fSupplyID,
                    Fnote: inventoryApplication?.fUse, // TODO: 需要金蝶处理问题后启用，并关注单据写入是否报错
                    FROB: 1,
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createSubcontractdelivery(kisRequest);
              break;
            case "采购退货出库":
              externalEntityTypeName = "外购入库红字";
              for (const transfer of transfers) {
                entries.push({
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FMTONo: transfer.lot_num,
                  // FSecQty: transfer.quantity,
                  // FSecCoefficient: 1,
                  // FAuxPrice: 1,
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    // FDCStockID: warehouseId,
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 1,
                    FDeptID: departmentId || "769",
                    FPOStyle: inventoryApplication?.fPOStyle,
                    FSupplyID: inventoryApplication?.fSupplyID,
                    FHeadSelfA0143: inspectionSheet?.inspector?.externalCode,
                    FROB: -1,
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createPurchaseReceipt(kisRequest);
              break;
            case "生产入库退货出库":
              externalEntityTypeName = "产品入库红字";
              for (const transfer of transfers) {
                entries.push({
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FMTONo: transfer.lot_num,
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    FDeptID: departmentId || "778",
                    // FDCStockID: warehouseId,
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 2,
                    FROB: -1,
                    FHeadSelfA0143: inspectionSheet?.inspector?.externalCode || "3286",
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createProductReceipt(kisRequest);
              break;
            case "其它原因出库":
              externalEntityTypeName = "其他出库";
              for (const transfer of transfers) {
                let entity: any = {
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FMTONo: transfer.lot_num,
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  Fnote: transfer.remark,
                  FPlanMode: 14036,
                };

                if (locationCode !== 0) {
                  entity.FDCSPID = locationCode;
                }

                entries.push(entity);
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    // FSCStockID: warehouseId,
                    FFManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 29,
                    FDeptID: departmentId || "783",
                    Fuse: inventoryApplication.fUse || "",
                    FROB: 1,
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createMiscellaneousDelivery(kisRequest);
              break;
            case "领料出库":
              externalEntityTypeName = "生产领料";
              for (const transfer of transfers) {
                entries.push({
                  FItemID: parseInt(transfer.material_external_code, 10),
                  FQty: parseFloat(transfer.quantity.toFixed(2)),
                  Fauxqty: parseFloat(transfer.quantity.toFixed(2)),
                  FAuxQtyMust: parseFloat(transfer.must_quantity.toFixed(2)),
                  FDCSPID: locationCode,
                  FSCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: parseInt(transfer.unit_external_code, 10),
                  // FMTONo: transfer.lot_num,
                  // FAuxPrice: 1,
                  // Famount: parseFloat(transfer.quantity.toFixed(2)),
                  FPlanMode: 14036,
                  FReProduceType: 1059,
                  Fnote: transfer.remark,
                });
              }

              kisRequest = {
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    // FSCStockID: warehouseId,
                    FPurposeID: 12000,
                    FDeptID: departmentId || "778",
                    FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                    FBillerID: inventoryApplication?.biller?.externalUserCode,
                    FTranType: 24,
                    FROB: 1,
                    Fuse: inventoryApplication.fUse || "",
                    FHeadSelfB0436: inventoryApplication.fPlanSn || "无",
                  },
                  Entry: entries,
                },
              };
              kisResponse = await kisOperationApi.createPickingList(kisRequest);
              break;
            default:
              break;
          }
        }

        if (kisResponse) {
          const eventLog: CreateEventLogInput = {
            sourceType: "app",
            eventTypeCode: "kis.syncInternalToExternal",
            targetTypeCode: "mom_inventory_application",
            targetCode: inventoryApplication.code,
            message: "",
            data: {
              kisRequest,
              kisResponse,
            },
          };

          if (kisResponse.errcode) {
            eventLog.level = "error";
            eventLog.message = `KIS${externalEntityTypeName}单据写入失败。WMS${inventoryApplication.businessType?.name}单号：${inventoryApplication.code}。${kisResponse.description}`;
          } else {
            eventLog.level = "info";
            eventLog.message = `KIS${externalEntityTypeName}单据写入成功。WMS${inventoryApplication.businessType?.name}单号：${inventoryApplication.code}。KIS单号：${kisResponse.data.FBillNo}`;
          }
          await server.getService<EventLogService>("eventLogService").createLog(eventLog);

          if (kisResponse.data?.FBillNo) {
            await inventoryOperationManager.updateEntityById({
              routeContext,
              id: input.operationId,
              entityToSave: {
                externalCode: kisResponse.data.FBillNo,
              },
            });
          }

          let inventoryApplicationChanges: Partial<MomInventoryApplication> = {};
          inventoryApplicationChanges.kisResponse = kisResponse.data?.FBillNo ? kisResponse.data.FBillNo : kisResponse.description;
          inventoryApplicationChanges.kisError = kisResponse.errcode ? kisResponse.description : undefined;

          await inventoryApplicationManager.updateEntityById({
            routeContext,
            id: inventoryOperation?.application?.id,
            entityToSave: inventoryApplicationChanges,
          });
        }
      }
    }
  }
}
