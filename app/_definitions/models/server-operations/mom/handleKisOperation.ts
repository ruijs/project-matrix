import type {ActionHandlerContext, IRpdServer, ServerOperation} from "@ruiapp/rapid-core";
import {
  KisConfig,
  MomInspectionSheet,
  MomInventoryApplication,
  MomInventoryOperation,
} from "~/_definitions/meta/entity-types";
import KisInventoryOperationAPI, {WarehouseEntry} from "~/sdk/kis/inventory";
import {getNowString} from "~/utils/time-utils";
import KisHelper from "~/sdk/kis/helper";

export type CreateGoodTransferInput = {
  operationId: number;
};

export default {
  code: "fix",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: CreateGoodTransferInput = ctx.input;

    await handleKisOperation(server, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

export async function handleKisOperation(server: IRpdServer, input: CreateGoodTransferInput) {
  const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");

  const kisApi = await new KisHelper(server).NewAPIClient();
  const kisOperationApi = new KisInventoryOperationAPI(kisApi);

  const inventoryOperation = await inventoryOperationManager.findEntity({
    filters: [
      {
        operator: "eq",
        field: "id",
        value: input.operationId,
      },
      {
        operator: "null",
        field: "externalCode",
      }
    ],
    properties: ["id", "code", "application", "warehouse", "operationType", "businessType", "contractNum", "supplier", "customer", "externalCode", "createdBy", "state", "approvalState"],
  });

  if (!inventoryOperation) {
    throw new Error(`Inventory operation with id ${ input.operationId } not found.`);
  }

  const inventoryApplication = await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").findEntity({
    filters: [
      {
        operator: "eq",
        field: "id",
        value: inventoryOperation?.application?.id,
      },
    ],
    properties: ["id", "supplier", "externalCode", "code", "contractNum", "customer", "businessType", "from", "to", "operationType", "createdBy", "biller", "fFManager", "fSManager", "fUse", "fPlanSn", "fPOStyle", "fSupplyID", "items", "fDeliveryCode", "express"],
  });

  if (!inventoryApplication) {
    throw new Error(`Inventory application with id ${ inventoryOperation?.application?.id } not found.`);
  }

  if (inventoryOperation.state === "done") {
    const kisConfig = await server.getEntityManager<KisConfig>("kis_config").findEntity({});

    if (kisConfig) {
      // transfer aggregate, sum quantity by material and lotnum and location
      const transfers = await server.queryDatabaseObject(
        `
          SELECT mai.material_id,
                 mai.lot_num,
                 bm.code             AS material_code,
                 bm.external_code    AS material_external_code,
                 bu.external_code    AS unit_external_code,
                 mai.accept_quantity as quantity,
                 mai.remark
          FROM mom_inventory_application_items mai
                 inner join base_materials bm on mai.material_id = bm.id
                 inner join base_units bu on bm.default_unit_id = bu.id
          WHERE mai.operation_id = $1
        `,
        [inventoryApplication.id]
      );

      if (inventoryOperation.approvalState === "approved") {
        let entries: WarehouseEntry[] = [];
        const warehouseId = inventoryApplication?.to?.externalCode || inventoryApplication?.from?.externalCode;

        const inspectionSheet = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
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

        if (inventoryOperation?.businessType?.operationType === "in") {
          // TODO: 生成KIS入库单
          switch (inventoryOperation?.businessType?.name) {
            case "采购入库":
              for (const transfer of transfers) {
                let locationCode = '1320'
                // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
                if (transfer.material_code.startsWith('01.')) {
                  locationCode = '1320'
                } else if (transfer.material_code.startsWith('03.')) {
                  locationCode = '1321'
                }

                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity,
                  Fauxqty: transfer.quantity,
                  FAuxQtyMust: transfer.quantity,
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

              kisResponse = await kisOperationApi.createPurchaseReceipt(
                {
                  Object: {
                    Head: {
                      Fdate: getNowString(),
                      // FDCStockID: warehouseId,
                      FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FBillerID: inventoryApplication?.biller?.externalUserCode,
                      FTranType: 1,
                      FDeptID: "769",
                      FPOStyle: inventoryApplication.fPOStyle,
                      FSupplyID: inventoryApplication.fSupplyID,
                      FHeadSelfA0143: inspectionSheet?.inspector?.externalCode
                    },
                    Entry: entries,
                  },
                })
              break;
            case "生产入库":
              for (const transfer of transfers) {
                let locationCode = '1320'
                // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
                if (transfer.material_code.startsWith('01.')) {
                  locationCode = '1320'
                } else if (transfer.material_code.startsWith('03.')) {
                  locationCode = '1321'
                }

                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity,
                  Fauxqty: transfer.quantity,
                  FAuxQtyMust: transfer.quantity,
                  FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity,
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createProductReceipt(
                {
                  Object: {
                    Head: {
                      Fdate: getNowString(),
                      FDeptID: "778",
                      // FDCStockID: warehouseId,
                      FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FBillerID: inventoryApplication?.biller?.externalUserCode,
                      FTranType: 2,
                      FROB: 1,
                      FHeadSelfA0143: inspectionSheet?.inspector?.externalCode || "3286"
                    },
                    Entry: entries,
                  },
                })
              break;
            // case "其它原因入库":
            //   for (const transfer of transfers) {
            //     let locationCode = '1320'
            //     // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
            //     if (transfer.material_code.startsWith('01.')) {
            //       locationCode = '1320'
            //     } else if (transfer.material_code.startsWith('03.')) {
            //       locationCode = '1321'
            //     }
            //
            //     entries.push({
            //       FItemID: transfer.material_external_code,
            //       FQty: transfer.quantity,
            //       Fauxqty: transfer.quantity,
            //       FAuxQtyMust: transfer.quantity,
            //       FDCSPID: locationCode,
            //       FDCStockID: warehouseId,
            //       FBatchNo: transfer.lot_num,
            //       FUnitID: transfer.unit_external_code,
            //       FMTONo: transfer.lot_num,
            //       FAuxPrice: 1,
            //       Famount: transfer.quantity,
            //       FPlanMode: 14036
            //     });
            //   }
            //
            //   kisResponse = await kisOperationApi.createMiscellaneousReceipt(
            //     {
            //       Object: {
            //         Head: {
            //           Fdate: getNowString(),
            //           FDCStockID: warehouseId,
            //           FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
            //           FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
            //           FBillerID: inventoryApplication?.createdBy?.externalUserCode,
            //           FTranType: 10,
            //           FROB: 1,
            //           FHeadSelfA0143: "3286"
            //         },
            //         Entry: entries,
            //       },
            //     })
            //   break;
            case "委外加工入库":
              for (const transfer of transfers) {
                let locationCode = '1320'
                // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
                if (transfer.material_code.startsWith('01.')) {
                  locationCode = '1320'
                } else if (transfer.material_code.startsWith('03.')) {
                  locationCode = '1321'
                }

                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity,
                  Fauxqty: transfer.quantity,
                  FAuxQtyMust: transfer.quantity,
                  // FDCSPID: locationCode,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity,
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createSubcontractReceipt(
                {
                  Object: {
                    Head: {
                      Fdate: getNowString(),
                      // FDCStockID: warehouseId,
                      FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FBillerID: inventoryApplication?.biller?.externalUserCode,
                      FTranType: 1,
                      FSupplyID: inventoryApplication?.fSupplyID,
                      FHeadSelfA0143: "3286"
                    },
                    Entry: entries,
                  },
                })
              break;
            case "生产退料入库":
              for (const transfer of transfers) {
                let locationCode = '1320'
                // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
                if (transfer.material_code.startsWith('01.')) {
                  locationCode = '1320'
                } else if (transfer.material_code.startsWith('03.')) {
                  locationCode = '1321'
                }

                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity,
                  Fauxqty: transfer.quantity,
                  FAuxQtyMust: transfer.quantity,
                  FDCSPID: locationCode,
                  FSCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity,
                  FPlanMode: 14036,
                  FReProduceType: 1059,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createPickingList(
                {
                  Object: {
                    Head: {
                      Fdate: getNowString(),
                      // FSCStockID: warehouseId,
                      FPurposeID: 12000,
                      FDeptID: "778",
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
                })
              break;
            default:
              break;
          }
        } else if (inventoryOperation.operationType === "out") {
          switch (inventoryOperation?.businessType?.name) {
            case "销售出库":
              transfers.forEach((transfer, idx) => {
                let locationCode = '1320'
                // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
                if (transfer.material_code.startsWith('01.')) {
                  locationCode = '1320'
                } else if (transfer.material_code.startsWith('03.')) {
                  locationCode = '1321'
                }

                if (inventoryApplication.to?.name === "外租仓库" || inventoryApplication.from?.name === "外租仓库") {
                  locationCode = ""
                }

                let entity: any = {
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity,
                  Fauxqty: transfer.quantity,
                  FAuxQtyMust: transfer.quantity,
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
                  Famount: transfer.quantity,
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                }

                if (locationCode !== "") {
                  entity.FDCSPID = locationCode
                }

                entries.push(entity);
              });

              kisResponse = await kisOperationApi.createSalesDelivery(
                {
                  Object: {
                    Head: {
                      Fdate: getNowString(),
                      FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FBillerID: inventoryApplication?.biller?.externalUserCode,
                      FEmpID: inventoryApplication?.applicant?.externalCode,
                      FTranType: 21,
                      FDeptID: "781",
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
                })
              break;
            case "委外加工出库":
              for (const transfer of transfers) {
                let locationCode = '1320'
                // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
                if (transfer.material_code.startsWith('01.')) {
                  locationCode = '1320'
                } else if (transfer.material_code.startsWith('03.')) {
                  locationCode = '1321'
                }

                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity,
                  Fauxqty: transfer.quantity,
                  FAuxQtyMust: transfer.quantity,
                  FDCSPID: locationCode,
                  FSCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity,
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createSubcontractdelivery(
                {
                  Object: {
                    Head: {
                      Fdate: getNowString(),
                      // FDCStockID: warehouseId,
                      FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FBillerID: inventoryApplication?.biller?.externalUserCode,
                      FTranType: 28,
                      FPurposeID: 14190,
                      FROB: 1,
                    },
                    Entry: entries,
                  },
                })
              break;
            case "其它原因出库":
              for (const transfer of transfers) {
                let locationCode = '1320'
                // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
                if (transfer.material_code.startsWith('01.')) {
                  locationCode = '1320'
                } else if (transfer.material_code.startsWith('03.')) {
                  locationCode = '1321'
                }

                if (inventoryApplication.to?.name === "外租仓库" || inventoryApplication.from?.name === "外租仓库") {
                  locationCode = ""
                }

                let entity: any = {
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity,
                  Fauxqty: transfer.quantity,
                  FAuxQtyMust: transfer.quantity,
                  FDCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity,
                  FPlanMode: 14036,
                  Fnote: transfer.remark,
                }

                if (locationCode !== "") {
                  entity.FDCSPID = locationCode
                }

                entries.push(entity);
              }

              kisResponse = await kisOperationApi.createMiscellaneousDelivery(
                {
                  Object: {
                    Head: {
                      Fdate: getNowString(),
                      // FSCStockID: warehouseId,
                      FFManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FSManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
                      FBillerID: inventoryApplication?.biller?.externalUserCode,
                      FTranType: 29,
                      FDeptID: "783",
                      Fuse: inventoryApplication.fUse || "",
                      FROB: 1,
                    },
                    Entry: entries,
                  },
                })
              break;
            case "领料出库":
              for (const transfer of transfers) {
                let locationCode = '1320'
                // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
                if (transfer.material_code.startsWith('01.')) {
                  locationCode = '1320'
                } else if (transfer.material_code.startsWith('03.')) {
                  locationCode = '1321'
                }

                entries.push({
                  FItemID: transfer.material_external_code,
                  FQty: transfer.quantity,
                  Fauxqty: transfer.quantity,
                  FAuxQtyMust: transfer.quantity,
                  FDCSPID: locationCode,
                  FSCStockID: warehouseId,
                  FBatchNo: transfer.lot_num,
                  FUnitID: transfer.unit_external_code,
                  // FMTONo: transfer.lot_num,
                  FAuxPrice: 1,
                  Famount: transfer.quantity,
                  FPlanMode: 14036,
                  FReProduceType: 1059,
                  Fnote: transfer.remark,
                });
              }

              kisResponse = await kisOperationApi.createPickingList(
                {
                  Object: {
                    Head: {
                      Fdate: getNowString(),
                      // FSCStockID: warehouseId,
                      FPurposeID: 12000,
                      FDeptID: "778",
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
                })
              break;
            default:
              break;
          }
        }


        if (kisResponse) {
          await inventoryOperationManager.updateEntityById({
            id: input.operationId,
            entityToSave: {
              externalCode: kisResponse.data.FBillNo,
            },
          })
        }
      }
    }
  }
}

