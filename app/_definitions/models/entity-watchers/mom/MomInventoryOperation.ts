import type {
  ActionHandlerContext,
  EntityWatcher,
  EntityWatchHandlerContext,
  IRpdServer,
  RouteContext
} from "@ruiapp/rapid-core";
import {MomInventoryOperationType} from "~/_definitions/meta/data-dictionary-types";
import {
  BaseLocation,
  KisConfig,
  MomGood,
  MomGoodTransfer,
  MomInventoryApplication,
  type MomInventoryBusinessType,
  type MomInventoryOperation,
  MomInventoryStatTable,
  MomInventoryStatTrigger,
  MomWarehouse,
  SaveBaseLotInput,
  SaveMomGoodInput,
  SaveMomInventoryOperationInput,
} from "~/_definitions/meta/entity-types";
import InventoryStatService, {StatTableConfig} from "~/services/InventoryStatService";
import KisHelper from "~/sdk/kis/helper";
import KisInventoryOperationAPI, {WarehouseEntry} from "~/sdk/kis/inventory";
import rapidApi from "~/rapidApi";
import {getNowString} from "~/utils/time-utils";
import dayjs from "dayjs";
import {isPlainObject} from "lodash";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_inventory_operation",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, payload } = ctx;
      let before = payload.before;
      try {
        let applicationId = before?.application_id ? before.application_id : before?.application;
        if (isPlainObject(before?.application)) {
          applicationId = before.application.id;
        }
        if (applicationId && applicationId > 0) {
          const application = await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").findEntity({
            filters: [
              {
                operator: "eq",
                field: "id",
                value: applicationId,
              },
            ],
            properties: ["id", "operationType", "from", "to"],
          });
          switch (application?.operationType) {
            case "in":
              before.warehouse_id = application.to?.id;
              break;
            case "out":
              before.warehouse_id = application.from?.id;
              break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_inventory_operation",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;
      const changes = payload.after;
      try {
        if (changes?.application) {
          const applicationManager = server.getEntityManager<MomInventoryApplication>("mom_inventory_application");
          await applicationManager.updateEntityById({
            routeContext: ctx.routerContext,
            id: changes.application.id,
            entityToSave: {
              operationState: "processing",
            },
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_inventory_operation",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, payload } = ctx;
      const kisApi = await new KisHelper(server).NewAPIClient();
      const kisOperationApi = new KisInventoryOperationAPI(kisApi);

      const changes = payload.changes;
      const after = payload.after;

      try {
        const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");

        const inventoryOperation = await inventoryOperationManager.findEntity({
          filters: [
            {
              operator: "eq",
              field: "id",
              value: after.id,
            },
          ],
          properties: ["id", "code", "application", "warehouse", "operationType", "businessType", "contractNum", "supplier", "customer", "externalCode", "createdBy", "state", "approvalState"],
        });

        const inventoryApplication = await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").findEntity({
          filters: [
            {
              operator: "eq",
              field: "id",
              value: inventoryOperation?.application?.id,
            },
          ],
          properties: ["id", "businessType", "from", "to", "operationType", "createdBy"],
        });

        if (changes.hasOwnProperty("approvalState") && changes.approvalState === "approved") {

          // 处理库存盘点
          if (inventoryApplication?.businessType && inventoryApplication.businessType.name === "库存盘点") {

            const inventoryBusinessTypes = await server.getEntityManager<MomInventoryBusinessType>("mom_inventory_business_type").findEntities({
              filters: [
                {
                  operator: "or",
                  filters: [
                    {
                      operator: "eq",
                      field: "name",
                      value: "盘盈入库",
                    },
                    {
                      operator: "eq",
                      field: "name",
                      value: "盘亏出库",
                    }
                  ]
                }
              ],
              properties: ["id", "name", "code", "operationType"],
            });

            if (inventoryOperation) {

              const resp = await rapidApi.post("app/listInventoryCheckTransfers", { "operationId": after.id });

              const records = resp.data;

              if (records) {
                const profitInventoryBusinessType = inventoryBusinessTypes.find(item => item.name === "盘盈入库");

                let profitInventoryOperationInput = {
                  application_id: inventoryOperation.application?.id,
                  operationType: profitInventoryBusinessType?.operationType,
                  state: "processing",
                  approvalState: "uninitiated",
                  businessType: { id: profitInventoryBusinessType?.id },
                } as SaveMomInventoryOperationInput

                let profitTransfers = [];
                for (const record of records) {
                  for (const profitGood of record.profitGoods) {
                    profitTransfers.push({
                      good: { id: profitGood.id },
                      material: { id: record.material?.id },
                      unit: { id: record.material?.defaultUnit?.id },
                      quantity: profitGood.quantity,
                      binNum: profitGood.binNum,
                      lotNum: profitGood.lotNum,
                      manufactureDate: profitGood.manufactureDate,
                      validityDate: profitGood.validityDate,
                      lot: { id: profitGood.lotId },
                      orderNum: 1,
                    } as MomGoodTransfer);
                  }
                }

                profitInventoryOperationInput.transfers = profitTransfers

                await inventoryOperationManager.createEntity({
                  entity: profitInventoryOperationInput,
                })

                const lossesInventoryBusinessType = inventoryBusinessTypes.find(item => item.name === "盘亏出库");

                let lossesInventoryOperationInput = {
                  application_id: inventoryOperation.application?.id,
                  operationType: lossesInventoryBusinessType?.operationType,
                  state: "done",
                  approvalState: "approved",
                  businessType: { id: lossesInventoryBusinessType?.id },
                } as SaveMomInventoryOperationInput

                let lossTransfers = [];
                for (const record of records) {
                  for (const lossGood of record.lossGoods) {
                    lossTransfers.push({
                      good: { id: lossGood.id },
                      material: { id: record.material?.id },
                      unit: { id: record.material?.defaultUnit?.id },
                      quantity: lossGood.quantity,
                      binNum: lossGood.binNum,
                      lotNum: lossGood.lotNum,
                      manufactureDate: lossGood.manufactureDate,
                      validityDate: lossGood.validityDate,
                      lot: { id: lossGood.lotId },
                      orderNum: 1,
                    } as MomGoodTransfer);
                  }
                }

                profitInventoryOperationInput.transfers = lossTransfers

                await inventoryOperationManager.createEntity({
                  entity: lossesInventoryOperationInput,
                })
              }
            }
          } else {
            if (inventoryOperation) {
              let transfers = await listTransfersOfOperation(server, after.id);

              if (inventoryOperation.operationType === "in") {
                for (const transfer of transfers) {
                  if (transfer.good_id && transfer.to_location_id) {
                    await server.getEntityManager<MomGood>("mom_good").updateEntityById({
                      routeContext: ctx.routerContext,
                      id: transfer.good_id,
                      entityToSave: {
                        state: "normal",
                        location: { id: transfer.to_location_id },
                        putInTime: dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]"),
                      } as SaveMomGoodInput,
                    });
                  }
                }
              }

              if (inventoryOperation.operationType === "out") {
                for (const transfer of transfers) {
                  if (transfer.good_id) {
                    await server.getEntityManager<MomGood>("mom_good").updateEntityById({
                      routeContext: ctx.routerContext,
                      id: transfer.good_id,
                      entityToSave: {
                        state: "transferred",
                      } as SaveMomGoodInput,
                    });
                  }
                }
              }

              if ((inventoryOperation.operationType === "in" || inventoryOperation.operationType === "out") && inventoryOperation.businessType && inventoryOperation.businessType.id) {
                await updateInventoryStats(server, inventoryOperation?.businessType?.id, inventoryOperation.operationType, transfers);
              }
            }
          }
        }

        if (after.hasOwnProperty("state") && after.state === "done") {
          if (after?.application_id) {
            await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").updateEntityById({
              routeContext: ctx.routerContext,
              id: after.application_id,
              entityToSave: {
                operationState: "done",
              },
            });
          }

          // const kisConfig = await server.getEntityManager<KisConfig>("kis_config").findEntity({});
          // if (kisConfig) {
          //   // transfer aggregate, sum quantity by material and lotnum and location
          //   const transfers = await server.queryDatabaseObject(
          //     `
          //       SELECT mgt.material_id,
          //              mgt.lot_num,
          //              bm.external_code                               AS material_external_code,
          //              mgt.lot_id,
          //              coalesce(tbl.id, fbl.id)                       AS location_id,
          //              coalesce(tbl.external_code, fbl.external_code) AS location_external_code,
          //              bu.external_code                               AS unit_external_code,
          //              SUM(mgt.quantity)                              AS quantity
          //       FROM mom_good_transfers mgt
          //              inner join base_materials bm on mgt.material_id = bm.id
          //              left join base_locations tbl ON mgt.to_location_id = tbl.id
          //              left join base_locations fbl ON mgt.from_location_id = fbl.id
          //              inner join base_units bu on bm.default_unit_id = bu.id
          //       WHERE operation_id = $1
          //       GROUP BY mgt.material_id, bm.external_code, mgt.lot_num, mgt.lot_id, tbl.id, tbl.external_code, fbl.id,
          //                fbl.external_code, bu.external_code;
          //     `,
          //     [after.id]
          //   );
          //
          //   if (inventoryApplication && inventoryOperation?.application?.source === 'manual' && !inventoryOperation.externalCode && changes.hasOwnProperty("approvalState") && changes.approvalState === "approved") {
          //     let entries: WarehouseEntry[] = [];
          //     const warehouseId = inventoryApplication?.to?.externalCode || inventoryApplication?.from?.externalCode;
          //
          //     let kisResponse: any;
          //
          //     if (inventoryOperation?.businessType?.operationType === "in") {
          //       // switch (inventoryOperation?.businessType?.name) {
          //       //   case "采购入库":
          //       //     for (const transfer of transfers) {
          //       //       let locationCode = '1320'
          //       //       // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //       //       if (transfer.material_code.startsWith('01.')) {
          //       //         locationCode = '1320'
          //       //       } else if (transfer.material_code.startsWith('03.')) {
          //       //         locationCode = '1321'
          //       //       }
          //       //
          //       //       entries.push({
          //       //         FItemID: transfer.material_external_code,
          //       //         FQty: transfer.quantity,
          //       //         Fauxqty: transfer.quantity,
          //       //         FAuxQtyMust: transfer.quantity,
          //       //         FDCSPID: locationCode,
          //       //         FDCStockID: warehouseId,
          //       //         FBatchNo: transfer.lot_num,
          //       //         FUnitID: transfer.unit_external_code,
          //       //         FMTONo: transfer.lot_num,
          //       //         FAuxPrice: 1,
          //       //         Famount: transfer.quantity,
          //       //         FPlanMode: 14036
          //       //       });
          //       //     }
          //       //
          //       //     kisResponse = await kisOperationApi.createPurchaseReceipt(
          //       //       {
          //       //         Object: {
          //       //           Head: {
          //       //             Fdate: getNowString(),
          //       //             FDCStockID: warehouseId,
          //       //             FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //       //             FTranType: 1,
          //       //             FDeptID: "769",
          //       //           },
          //       //           Entry: entries,
          //       //         },
          //       //       })
          //       //     break;
          //       //   case "生产入库":
          //       //     for (const transfer of transfers) {
          //       //       let locationCode = '1320'
          //       //       // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //       //       if (transfer.material_code.startsWith('01.')) {
          //       //         locationCode = '1320'
          //       //       } else if (transfer.material_code.startsWith('03.')) {
          //       //         locationCode = '1321'
          //       //       }
          //       //
          //       //
          //       //       entries.push({
          //       //         FItemID: transfer.material_external_code,
          //       //         FQty: transfer.quantity,
          //       //         Fauxqty: transfer.quantity,
          //       //         FAuxQtyMust: transfer.quantity,
          //       //         FDCSPID: locationCode,
          //       //         FDCStockID: warehouseId,
          //       //         FBatchNo: transfer.lot_num,
          //       //         FUnitID: transfer.unit_external_code,
          //       //         FMTONo: transfer.lot_num,
          //       //         FAuxPrice: 1,
          //       //         Famount: transfer.quantity,
          //       //         FPlanMode: 14036
          //       //       });
          //       //     }
          //       //
          //       //     kisResponse = await kisOperationApi.createProductReceipt(
          //       //       {
          //       //         Object: {
          //       //           Head: {
          //       //             Fdate: getNowString(),
          //       //             FDeptID: "778",
          //       //             FDCStockID: warehouseId,
          //       //             FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //       //             FTranType: 2,
          //       //             FROB: 1,
          //       //           },
          //       //           Entry: entries,
          //       //         },
          //       //       })
          //       //     break;
          //       //   case "其它原因入库":
          //       //     for (const transfer of transfers) {
          //       //       let locationCode = '1320'
          //       //       // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //       //       if (transfer.material_code.startsWith('01.')) {
          //       //         locationCode = '1320'
          //       //       } else if (transfer.material_code.startsWith('03.')) {
          //       //         locationCode = '1321'
          //       //       }
          //       //
          //       //       entries.push({
          //       //         FItemID: transfer.material_external_code,
          //       //         FQty: transfer.quantity,
          //       //         Fauxqty: transfer.quantity,
          //       //         FAuxQtyMust: transfer.quantity,
          //       //         FDCSPID: locationCode,
          //       //         FDCStockID: warehouseId,
          //       //         FBatchNo: transfer.lot_num,
          //       //         FUnitID: transfer.unit_external_code,
          //       //         FMTONo: transfer.lot_num,
          //       //         FAuxPrice: 1,
          //       //         Famount: transfer.quantity,
          //       //         FPlanMode: 14036
          //       //       });
          //       //     }
          //       //
          //       //     kisResponse = await kisOperationApi.createMiscellaneousReceipt(
          //       //       {
          //       //         Object: {
          //       //           Head: {
          //       //             Fdate: getNowString(),
          //       //             FDCStockID: warehouseId,
          //       //             FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //       //             FTranType: 10,
          //       //             FROB: 1,
          //       //           },
          //       //           Entry: entries,
          //       //         },
          //       //       })
          //       //     break;
          //       //   case "委外加工入库":
          //       //     for (const transfer of transfers) {
          //       //       let locationCode = '1320'
          //       //       // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //       //       if (transfer.material_code.startsWith('01.')) {
          //       //         locationCode = '1320'
          //       //       } else if (transfer.material_code.startsWith('03.')) {
          //       //         locationCode = '1321'
          //       //       }
          //       //
          //       //       entries.push({
          //       //         FItemID: transfer.material_external_code,
          //       //         FQty: transfer.quantity,
          //       //         Fauxqty: transfer.quantity,
          //       //         FAuxQtyMust: transfer.quantity,
          //       //         FDCSPID: locationCode,
          //       //         FDCStockID: warehouseId,
          //       //         FBatchNo: transfer.lot_num,
          //       //         FUnitID: transfer.unit_external_code,
          //       //         FMTONo: transfer.lot_num,
          //       //         FAuxPrice: 1,
          //       //         Famount: transfer.quantity,
          //       //         FPlanMode: 14036
          //       //       });
          //       //     }
          //       //
          //       //     kisResponse = await kisOperationApi.createSubcontractReceipt(
          //       //       {
          //       //         Object: {
          //       //           Head: {
          //       //             Fdate: getNowString(),
          //       //             FDCStockID: warehouseId,
          //       //             FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //       //             FTranType: 1,
          //       //           },
          //       //           Entry: entries,
          //       //         },
          //       //       })
          //       //     break;
          //       //   case "生产退料入库":
          //       //     for (const transfer of transfers) {
          //       //       let locationCode = '1320'
          //       //       // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //       //       if (transfer.material_code.startsWith('01.')) {
          //       //         locationCode = '1320'
          //       //       } else if (transfer.material_code.startsWith('03.')) {
          //       //         locationCode = '1321'
          //       //       }
          //       //
          //       //       entries.push({
          //       //         FItemID: transfer.material_external_code,
          //       //         FQty: transfer.quantity,
          //       //         Fauxqty: transfer.quantity,
          //       //         FAuxQtyMust: transfer.quantity,
          //       //         FDCSPID: locationCode,
          //       //         FDCStockID: warehouseId,
          //       //         FBatchNo: transfer.lot_num,
          //       //         FUnitID: transfer.unit_external_code,
          //       //         FMTONo: transfer.lot_num,
          //       //         FAuxPrice: 1,
          //       //         Famount: transfer.quantity,
          //       //         FPlanMode: 14036
          //       //       });
          //       //     }
          //       //
          //       //     kisResponse = await kisOperationApi.createPickingList(
          //       //       {
          //       //         Object: {
          //       //           Head: {
          //       //             Fdate: getNowString(),
          //       //             FDCStockID: warehouseId,
          //       //             FPurposeID: 1200,
          //       //             FDeptID: "778",
          //       //             FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //       //             FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //       //             FTranType: 24,
          //       //             FROB: -1,
          //       //           },
          //       //           Entry: entries,
          //       //         },
          //       //       })
          //       //     break;
          //       //   default:
          //       //     break;
          //       // }
          //     } else if (inventoryOperation.operationType === "out") {
          //       switch (inventoryOperation?.businessType?.name) {
          //         // case "销售出库":
          //         //   for (const transfer of transfers) {
          //         //     let locationCode = '1320'
          //         //     // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //         //     if (transfer.material_code.startsWith('01.')) {
          //         //       locationCode = '1320'
          //         //     } else if (transfer.material_code.startsWith('03.')) {
          //         //       locationCode = '1321'
          //         //     }
          //         //
          //         //     entries.push({
          //         //       FItemID: transfer.material_external_code,
          //         //       FQty: transfer.quantity,
          //         //       Fauxqty: transfer.quantity,
          //         //       FAuxQtyMust: transfer.quantity,
          //         //       FDCSPID: locationCode,
          //         //       FSCStockID: warehouseId,
          //         //       FBatchNo: transfer.lot_num,
          //         //       FUnitID: transfer.unit_external_code,
          //         //       FMTONo: transfer.lot_num,
          //         //       FAuxPrice: 1,
          //         //       Famount: transfer.quantity,
          //         //       FPlanMode: 14036
          //         //     });
          //         //   }
          //         //
          //         //   kisResponse = await kisOperationApi.createSubcontractReceipt(
          //         //     {
          //         //       Object: {
          //         //         Head: {
          //         //           Fdate: getNowString(),
          //         //           FSCStockID: warehouseId,
          //         //           FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //         //           FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //         //           FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //         //           FTranType: 21,
          //         //           FDeptID: "781",
          //         //           FROB: 1,
          //         //         },
          //         //         Entry: entries,
          //         //       },
          //         //     })
          //         //   break;
          //         case "委外加工出库":
          //           for (const transfer of transfers) {
          //             let locationCode = '1320'
          //             // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //             if (transfer.material_code.startsWith('01.')) {
          //               locationCode = '1320'
          //             } else if (transfer.material_code.startsWith('03.')) {
          //               locationCode = '1321'
          //             }
          //
          //             entries.push({
          //               FItemID: transfer.material_external_code,
          //               FQty: transfer.quantity,
          //               Fauxqty: transfer.quantity,
          //               FAuxQtyMust: transfer.quantity,
          //               FDCSPID: locationCode,
          //               FSCStockID: warehouseId,
          //               FBatchNo: transfer.lot_num,
          //               FUnitID: transfer.unit_external_code,
          //               FMTONo: transfer.lot_num,
          //               FAuxPrice: 1,
          //               Famount: transfer.quantity,
          //               FPlanMode: 14036
          //             });
          //           }
          //
          //           kisResponse = await kisOperationApi.createSubcontractdelivery(
          //             {
          //               Object: {
          //                 Head: {
          //                   Fdate: getNowString(),
          //                   FDCStockID: warehouseId,
          //                   FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //                   FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //                   FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //                   FTranType: 28,
          //                   FPurposeID: 14190,
          //                   FROB: 1,
          //                 },
          //                 Entry: entries,
          //               },
          //             })
          //           break;
          //         case "其它原因出库":
          //           for (const transfer of transfers) {
          //             let locationCode = '1320'
          //             // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //             if (transfer.material_code.startsWith('01.')) {
          //               locationCode = '1320'
          //             } else if (transfer.material_code.startsWith('03.')) {
          //               locationCode = '1321'
          //             }
          //
          //             entries.push({
          //               FItemID: transfer.material_external_code,
          //               FQty: transfer.quantity,
          //               Fauxqty: transfer.quantity,
          //               FAuxQtyMust: transfer.quantity,
          //               FDCSPID: locationCode,
          //               FSCStockID: warehouseId,
          //               FBatchNo: transfer.lot_num,
          //               FUnitID: transfer.unit_external_code,
          //               FMTONo: transfer.lot_num,
          //               FAuxPrice: 1,
          //               Famount: transfer.quantity,
          //               FPlanMode: 14036
          //             });
          //           }
          //
          //           kisResponse = await kisOperationApi.createMiscellaneousDelivery(
          //             {
          //               Object: {
          //                 Head: {
          //                   Fdate: getNowString(),
          //                   FSCStockID: warehouseId,
          //                   FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //                   FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //                   FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //                   FTranType: 29,
          //                   FDeptID: "783",
          //                   FROB: 1,
          //                 },
          //                 Entry: entries,
          //               },
          //             })
          //           break;
          //         case "领料出库":
          //           for (const transfer of transfers) {
          //             let locationCode = '1320'
          //             // check if transfer.material_code prefix is 01. if so, set locationCode to 1320, if 03. set to 1321
          //             if (transfer.material_code.startsWith('01.')) {
          //               locationCode = '1320'
          //             } else if (transfer.material_code.startsWith('03.')) {
          //               locationCode = '1321'
          //             }
          //
          //             entries.push({
          //               FItemID: transfer.material_external_code,
          //               FQty: transfer.quantity,
          //               Fauxqty: transfer.quantity,
          //               FAuxQtyMust: transfer.quantity,
          //               FDCSPID: locationCode,
          //               FSCStockID: warehouseId,
          //               FBatchNo: transfer.lot_num,
          //               FUnitID: transfer.unit_external_code,
          //               FMTONo: transfer.lot_num,
          //               FAuxPrice: 1,
          //               Famount: transfer.quantity,
          //               FPlanMode: 14036,
          //               FReProduceType: 1059,
          //             });
          //           }
          //
          //           kisResponse = await kisOperationApi.createPickingList(
          //             {
          //               Object: {
          //                 Head: {
          //                   Fdate: getNowString(),
          //                   FSCStockID: warehouseId,
          //                   FPurposeID: 12000,
          //                   FDeptID: "778",
          //                   FFManagerID: inventoryApplication?.fFManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //                   FSManagerID: inventoryApplication?.fSManager?.externalCode || inventoryApplication?.createdBy?.externalCode,
          //                   FBillerID: inventoryApplication?.createdBy?.externalUserCode,
          //                   FTranType: 24,
          //                   FROB: 1,
          //                   Fuse: inventoryApplication.fUse,
          //                   FHeadSelfB0436: inventoryApplication.fPlanSn
          //                 },
          //                 Entry: entries,
          //               },
          //             })
          //           break;
          //         default:
          //           break;
          //       }
          //     } else if (inventoryOperation.operationType === "transfer") {
          //       //   TODO: 生成KIS调拨单
          //
          //     }
          //
          //     if (kisResponse) {
          //       await inventoryOperationManager.updateEntityById({
          //         id: after.id,
          //         entityToSave: {
          //           externalCode: kisResponse.data.FBillNo,
          //         },
          //       })
          //     }
          //   }
          // }
        }

        if (changes) {
          if (ctx?.routerContext?.state.userId) {
            await server.getEntityManager("sys_audit_log").createEntity({
              entity: {
                user: { id: ctx?.routerContext?.state.userId },
                targetSingularCode: "mom_inventory_operation",
                targetSingularName: `库存操作单 - ${ inventoryOperation?.businessType?.name } - ${ inventoryOperation?.code }`,
                method: "update",
                changes: changes,
              }
            })
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
  },
  {
    eventName: "entity.beforeDelete",
    modelSingularCode: "mom_inventory_operation",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeDelete">) => {
      const { server, payload } = ctx;

      const before = payload.before
      try {
        const inventoryOperation = await server.getEntityManager<MomInventoryOperation>("mom_inventory_operation").findEntity({
          filters: [
            {
              operator: "eq",
              field: "id",
              value: before.id,
            },
          ],
          properties: ["id", "code", "businessType"],
        });

        if (ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inventory_operation",
              targetSingularName: `库存操作单 - ${ inventoryOperation?.businessType?.name } - ${ inventoryOperation?.code }`,
              method: "delete",
            }
          })
        }

      } catch (e) {
        console.error(e);
      }
    },
  },

] satisfies EntityWatcher<any>[];

async function listTransfersOfOperation(server: IRpdServer, operationId: number) {
  const transferManager = server.getEntityManager("mom_good_transfer");

  return await transferManager.findEntities({
    filters: [
      {
        operator: "eq",
        field: "operation_id",
        value: operationId,
      },
    ],
    keepNonPropertyFields: true,
  });
}

async function updateInventoryStats(server: IRpdServer, businessId: number, operationType: MomInventoryOperationType, transfers: any[]) {
  const businessTypeManager = server.getEntityManager<MomInventoryBusinessType>("mom_inventory_business_type");
  const businessType = await businessTypeManager.findById(businessId);
  if (!businessType) {
    return;
  }

  const statTriggerName = businessType?.config?.statTriggerName;

  let quantityFieldsToIncrease: string[] = [];
  let quantityFieldsToDecrease: string[] = [];
  const defaultGroupFields = ["material_id", "tags"];
  if (statTriggerName) {
    const statTriggerManager = server.getEntityManager<MomInventoryStatTrigger>("mom_inventory_stat_trigger");
    const statTrigger = await statTriggerManager.findEntity({
      filters: [
        {
          operator: "eq",
          field: "name",
          value: businessType.config?.statTriggerName,
        },
      ],
    });

    quantityFieldsToIncrease = statTrigger?.config?.quantityFieldsToIncrease || [];
    quantityFieldsToDecrease = statTrigger?.config?.quantityFieldsToDecrease || [];
  }

  const statTableManager = server.getEntityManager<MomInventoryStatTable>("mom_inventory_stat_table");
  const statTables = await statTableManager.findEntities({});

  const inventoryStatService = new InventoryStatService(server);

  for (const transfer of transfers) {
    if (transfer?.to_location_id) {

      const warehouseId = await server.queryDatabaseObject(
        `
        SELECT get_root_location_id($1) AS id;
      `,
        [transfer.to_location_id]
      );

      transfer['warehouse_id'] = warehouseId[0]?.id;


      if (transfer.lot_id) {
        const lotManager = server.getEntityManager<MomWarehouse>("base_lot");
        await lotManager.updateEntityById({
          id: transfer.lot_id,
          entityToSave: {
            state: "normal",
          } as SaveBaseLotInput,
        });
      }

      transfer['location_id'] = transfer.to_location_id;
    }
    if (transfer?.from_location_id) {
      const warehouseId = await server.queryDatabaseObject(
        `
        SELECT get_root_location_id($1) AS id;
      `,
        [transfer.from_location_id]
      );

      transfer['warehouse_id'] = warehouseId[0]?.id;

      transfer['location_id'] = transfer.from_location_id;
    }
  }

  for (const transfer of transfers) {
    for (const statTable of statTables) {
      const statTableConfig: StatTableConfig = statTable.config as any;
      const quantityBalanceFields: string[] = statTableConfig.quantityBalanceFields;
      if (!quantityBalanceFields) {
        continue;
      }

      const groupFields: string[] = statTableConfig.groupFields || defaultGroupFields;
      let quantityChange = transfer.quantity;
      // if (operationType === "out") {
      //   quantityChange *= -1;
      // }

      await inventoryStatService.changeInventoryQuantities({
        balanceEntityCode: statTableConfig.balanceEntityCode,
        logEntityCode: statTableConfig.logEntityCode,
        quantityBalanceFields: quantityBalanceFields,
        quantityChangeFields: statTableConfig.quantityChangeFields,
        groupFields: groupFields,
        groupValues: transfer,
        quantityFieldsToIncrease,
        quantityFieldsToDecrease,
        change: quantityChange,
      });
    }
  }
}
