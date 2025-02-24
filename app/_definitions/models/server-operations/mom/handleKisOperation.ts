import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import { KisConfig, MomInspectionSheet, MomInventoryApplication, MomInventoryOperation } from "~/_definitions/meta/entity-types";
import KisInventoryOperationAPI, { WarehouseEntry } from "~/sdk/kis/inventory";
import { getNowString } from "~/utils/time-utils";
import KisHelper from "~/sdk/kis/helper";
import dayjs from "dayjs";

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
      {
        operator: "null",
        field: "externalCode",
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
    ],
  });

  if (!inventoryApplication) {
    throw new Error(`Inventory application with id ${inventoryOperation?.application?.id} not found.`);
  }

  if (inventoryOperation.state === "done") {
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
        const warehouseId = inventoryApplication?.to?.externalCode || inventoryApplication?.from?.externalCode;

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

        let kisResponse: any;

        let locationCode = "";
        const warehouse = inventoryApplication?.to || inventoryApplication?.from;
        switch (warehouse?.name) {
          case "原料库":
            locationCode = "1320";
            break;
          case "成品库":
            locationCode = "1321";
            break;
          case "包材库":
            locationCode = "2";
            break;
          case "次品库":
            locationCode = "4";
            break;
          case "周转库":
            locationCode = "5";
            break;
          case "外租仓库":
            locationCode = "";
            break;
          default:
            break;
        }

        const departmentId = inventoryApplication?.department?.externalCode

        if (inventoryOperation?.businessType?.operationType === "in") {
          // TODO: 生成KIS入库单
          switch (inventoryOperation?.businessType?.name) {
            // case "采购入库":
            //   const allInspected = transfers.every((transfer) => transfer?.inspect_state);
            //   if (!allInspected) {
            //     console.log("All items must be inspected before creating a purchase receipt.");
            //     return;
            //   }
            //   for (const transfer of transfers) {
            //     if (transfer?.qualification_state && transfer.qualification_state === "qualified") {
            //       entries.push({
            //         FItemID: transfer.material_external_code,
            //         FQty: transfer.quantity.toFixed(2),
            //         Fauxqty: transfer.quantity.toFixed(2),
            //         FAuxQtyMust: transfer.must_quantity.toFixed(2),
            //         FDCSPID: locationCode,
            //         FDCStockID: warehouseId,
            //         FBatchNo: transfer.lot_num,
            //         FUnitID: transfer.unit_external_code,
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
            //     kisResponse = await kisOperationApi.createPurchaseReceipt({
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
            //     });
            //   }
            //   break;
            case "生产入库":
              for (const transfer of transfers) {
                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createProductReceipt({
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
              });
              break;
            case "委外加工入库":
              for (const transfer of transfers) {
                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  // FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createSubcontractReceipt({
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
              });
              break;
            case "生产退料入库":
              for (const transfer of transfers) {
                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCSPID: locationCode,
                  FSCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  FReProduceType: 1059,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createPickingList({
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
              });
              break;
            case "销售退货入库":
              transfers.forEach((transfer, idx) => {
                let entity: any = {
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  FSourceTranType: "81",
                  FSourceInterId: inventoryApplication?.externalCode,
                  FSourceBillNo: inventoryApplication?.code,
                  FSourceEntryID: idx + 1,
                  FOrderBillNo: inventoryApplication?.code,
                  FOrderInterID: inventoryApplication?.externalCode,
                  FOrderEntryID: idx + 1,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                };

                if (locationCode !== "") {
                  entity.FDCSPID = locationCode;
                }

                entries.push(entity);
              });

              kisResponse = await kisOperationApi.createSalesDelivery({
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
              });
              break;
            case "其它原因入库":
              for (const transfer of transfers) {
                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  // FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createMiscellaneousReceipt({
                Object: {
                  Head: {
                    Fdate: getNowString(),
                    // FDCStockID: warehouseId,
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
              });
              break;
            case "其它原因出库退货入库":
              for (const transfer of transfers) {
                let entity: any = {
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  Fnote: transfer.remark,
                  FPlanMode: 14036,
                };

                if (locationCode !== "") {
                  entity.FDCSPID = locationCode;
                }

                entries.push(entity);
              }

              kisResponse = await kisOperationApi.createMiscellaneousDelivery({
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
              });
              break;
            default:
              break;
          }
        } else if (inventoryOperation.operationType === "out") {
          switch (inventoryOperation?.businessType?.name) {
            case "销售出库":
              transfers.forEach((transfer, idx) => {
                let entity: any = {
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  FSourceTranType: "81",
                  FSourceInterId: inventoryApplication?.externalCode,
                  FSourceBillNo: inventoryApplication?.code,
                  FSourceEntryID: idx + 1,
                  FOrderBillNo: inventoryApplication?.code,
                  FOrderInterID: inventoryApplication?.externalCode,
                  FOrderEntryID: idx + 1,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                  FEntrySelfB0170: dayjs(transfer.manufacture_date).format("YYYY-MM-DDT00:00:00"),
                };

                if (locationCode !== "") {
                  entity.FDCSPID = locationCode;
                }

                entries.push(entity);
              });

              kisResponse = await kisOperationApi.createSalesDelivery({
                Object: {
                  Head: {
                    Fdate: getNowString(),
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
              });
              break;
            case "委外加工出库":
              for (const transfer of transfers) {
                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createSubcontractdelivery({
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
                    // Fnote: inventoryApplication?.fUse, // TODO: 需要金蝶处理问题后启用
                    FROB: 1,
                  },
                  Entry: entries,
                },
              });
              break;
            case "采购退货出库":
              for (const transfer of transfers) {
                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  // FSecQty: transfer.quantity,
                  // FSecCoefficient: 1,
                  // FAuxPrice: 1,
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createPurchaseReceipt({
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
              });
              break;
            case "生产入库退货出库":
              for (const transfer of transfers) {
                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createProductReceipt({
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
              });
              break;
            case "其它原因出库":
              for (const transfer of transfers) {
                let entity: any = {
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  Fnote: transfer.remark,
                  FPlanMode: 14036,
                };

                if (locationCode !== "") {
                  entity.FDCSPID = locationCode;
                }

                entries.push(entity);
              }

              kisResponse = await kisOperationApi.createMiscellaneousDelivery({
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
              });
              break;
            case "领料出库":
              for (const transfer of transfers) {
                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity.toFixed(2),
                  Fauxqty: transfer.quantity.toFixed(2),
                  FAuxQtyMust: transfer.must_quantity.toFixed(2),
                  FDCSPID: locationCode,
                  FSCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity.toFixed(2),
                  FPlanMode: 14036,
                  FReProduceType: 1059,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createPickingList({
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
              });
              break;
            default:
              break;
          }
        }

        if (kisResponse) {
          if (kisResponse.data?.FBillNo) {
            await inventoryOperationManager.updateEntityById({
              routeContext,
              id: input.operationId,
              entityToSave: {
                externalCode: kisResponse.data.FBillNo,
              },
            });
          }

          await inventoryApplicationManager.updateEntityById({
            routeContext,
            id: inventoryOperation?.application?.id,
            entityToSave: {
              kisResponse: kisResponse.data?.FBillNo ? kisResponse.data.FBillNo : kisResponse.description,
            },
          });
        }
      }
    }
  }
}
