import type { EntityWatcher, EntityWatchHandlerContext, IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import {
  type BaseLot,
  type BaseMaterial,
  MomGood,
  MomGoodTransfer,
  MomInspectionSheet,
  MomInventoryApplication,
  MomInventoryApplicationItem,
  type MomInventoryBusinessType,
  type MomInventoryOperation,
  type SaveBaseLotInput,
  type SaveMomGoodInput,
  SaveMomInventoryOperationInput,
} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import EntityManager from "@ruiapp/rapid-core/dist/dataAccess/entityManager";

interface MaterialAcceptCountMap {
  [materialId: number]: LotAcceptCountMap;
}

interface LotAcceptCountMap {
  [lotNum: string]: {
    quantity: number;
    palletCount: number;
  };
}

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_good_transfer",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      let before = payload.before;
      try {
        const goodManager = server.getEntityManager<MomGood>("mom_good");
        const materialManager = server.getEntityManager<BaseMaterial>("base_material");
        const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");

        const material = await materialManager.findEntity({
          routeContext,
          filters: [{ operator: "eq", field: "id", value: before.material.id }],
          properties: ["id", "code", "defaultUnit", "qualityGuaranteePeriod", "isInspectionFree"],
        });

        if (before.hasOwnProperty("lotNum") && before.hasOwnProperty("material")) {
          const inventoryOperation = await inventoryOperationManager.findEntity({
            routeContext,
            filters: [{ operator: "eq", field: "id", value: before.operation_id }],
            properties: ["id", "businessType"],
          });

          const lot = await saveMaterialLotInfo(server, routeContext, {
            lotNum: before.lotNum,
            material: before.material,
            sourceType: inventoryOperation?.businessType?.config?.defaultSourceType || null,
            qualificationState: material?.isInspectionFree ? "qualified" : inventoryOperation?.businessType?.config?.defaultQualificationState || "uninspected",
            isAOD: false,
            state: "pending",
          });

          if (lot) {
            before.lot_id = lot.id;
          }
        }

        if (before.hasOwnProperty("binNum") && before.hasOwnProperty("material") && !before.hasOwnProperty("good")) {
          if (material) {
            const goodInput = {
              material: { id: material.id },
              materialCode: material.code,
              lotNum: before.lotNum,
              lot: { id: before.lot_id },
              binNum: before.binNum,
              quantity: before.quantity,
              unit: { id: material.defaultUnit?.id },
              state: "pending",
            } as SaveMomGoodInput;
            const good = await findOrCreateGood(routeContext, goodManager, goodInput);
            before.good_id = good.id;
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_good_transfer",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      let after = payload.after;

      try {
        const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");

        const inventoryOperation = await inventoryOperationManager.findEntity({
          routeContext,
          filters: [{ operator: "eq", field: "id", value: after.operation_id || after.operation.id }],
          properties: ["id", "application", "businessType", "operationType"],
        });

        const momGoodTransfer = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntity({
          routeContext,
          filters: [{ operator: "eq", field: "id", value: after.id }],
          properties: ["id", "good", "from", "to"],
        });

        let materialAcceptCountMap: MaterialAcceptCountMap = {};
        if (inventoryOperation?.operationType === "in") {
          const goodTransfers = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntities({
            routeContext,
            filters: [{ operator: "eq", field: "operation_id", value: inventoryOperation.id }],
            properties: ["id", "lotNum", "lot", "material", "quantity"],
          });

          for (const goodTransfer of goodTransfers) {
            const materialId = goodTransfer.material?.id;
            const lotNum = goodTransfer.lotNum;

            if (!materialId || !lotNum || !goodTransfer.quantity) continue;

            if (!materialAcceptCountMap[materialId]) {
              materialAcceptCountMap[materialId] = {};
            }

            if (!materialAcceptCountMap[materialId][lotNum]) {
              materialAcceptCountMap[materialId][lotNum] = {
                quantity: 0,
                palletCount: 0,
              };
            }

            materialAcceptCountMap[materialId][lotNum].quantity += goodTransfer.quantity;
            materialAcceptCountMap[materialId][lotNum].palletCount += 1;
          }

          for (const materialId in materialAcceptCountMap) {
            const lotAcceptCountMap = materialAcceptCountMap[materialId];
            for (const lotNum in lotAcceptCountMap) {
              const applicationItems = await server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").findEntities({
                routeContext,
                filters: [
                  { operator: "eq", field: "lotNum", value: lotNum },
                  { operator: "eq", field: "material_id", value: materialId },
                  { operator: "eq", field: "operation_id", value: inventoryOperation?.application?.id },
                ],
                properties: ["id"],
              });

              for (const applicationItem of applicationItems) {
                await server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").updateEntityById({
                  routeContext,
                  id: applicationItem.id,
                  entityToSave: {
                    acceptQuantity: lotAcceptCountMap[lotNum].quantity,
                    acceptPalletCount: lotAcceptCountMap[lotNum].palletCount,
                  },
                });
              }

              const inspectionSheet = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
                routeContext,
                filters: [
                  { operator: "eq", field: "lotNum", value: lotNum },
                  { operator: "eq", field: "material_id", value: materialId },
                  { operator: "eq", field: "inventory_operation_id", value: inventoryOperation?.id },
                ],
                properties: ["id"],
              });

              if (inspectionSheet) {
                await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").updateEntityById({
                  routeContext,
                  id: inspectionSheet.id,
                  entityToSave: {
                    acceptQuantity: lotAcceptCountMap[lotNum].quantity,
                    acceptPalletCount: lotAcceptCountMap[lotNum].palletCount,
                  },
                });
              }
            }
          }
        }

        if (inventoryOperation?.operationType === "out") {
          const goodTransfers = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntities({
            routeContext,
            filters: [{ operator: "eq", field: "operation_id", value: inventoryOperation.id }],
            properties: ["id", "lotNum", "lot", "material", "quantity"],
          });

          goodTransfers.forEach((goodTransfer) => {
            if (goodTransfer.material && goodTransfer.material.id && goodTransfer.lotNum && goodTransfer.quantity) {
              if (!materialAcceptCountMap[goodTransfer.material.id]) {
                materialAcceptCountMap[goodTransfer.material.id] = {};
              }

              if (!materialAcceptCountMap[goodTransfer.material.id][goodTransfer.lotNum]) {
                materialAcceptCountMap[goodTransfer.material.id][goodTransfer.lotNum] = {
                  quantity: 0,
                  palletCount: 0,
                };
              }
              materialAcceptCountMap[goodTransfer.material.id][goodTransfer.lotNum].quantity += goodTransfer.quantity;
              materialAcceptCountMap[goodTransfer.material.id][goodTransfer.lotNum].palletCount += 1;
            }
          });

          for (let materialId in materialAcceptCountMap) {
            let lotAcceptCountMap = materialAcceptCountMap[materialId];
            for (let lotNum in lotAcceptCountMap) {
              const applicationItems = await server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").findEntities({
                routeContext,
                filters: [
                  { operator: "eq", field: "lotNum", value: lotNum },
                  { operator: "eq", field: "material_id", value: materialId },
                  { operator: "eq", field: "operation_id", value: inventoryOperation?.application?.id },
                ],
              });

              for (let applicationItem of applicationItems) {
                await server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").updateEntityById({
                  routeContext,
                  id: applicationItem.id,
                  entityToSave: {
                    acceptQuantity: lotAcceptCountMap[lotNum].quantity,
                    acceptPalletCount: lotAcceptCountMap[lotNum].palletCount,
                  },
                });
              }
            }
          }
        }

        if (inventoryOperation?.operationType === "organize" && momGoodTransfer?.good) {
          await server.getEntityManager<MomGood>("mom_good").updateEntityById({
            routeContext,
            id: momGoodTransfer.good.id,
            entityToSave: {
              location: { id: momGoodTransfer.to?.id || after.to_location_id },
              putInTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            },
          });
        }

        if (inventoryOperation?.businessType?.operationType === "out") {
          const inventoryApplication = await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").findEntity({
            routeContext,
            filters: [
              {
                operator: "eq",
                field: "id",
                value: inventoryOperation?.application?.id,
              },
            ],
            properties: ["id", "from", "to", "businessType"],
          });

          if (inventoryApplication?.businessType && inventoryApplication.businessType.name == "库存调拨") {
            const inventoryInOperation = await server.getEntityManager<MomInventoryOperation>("mom_inventory_operation").findEntity({
              routeContext,
              filters: [
                {
                  operator: "eq",
                  field: "application_id",
                  value: inventoryApplication?.id,
                },
                {
                  operator: "eq",
                  field: "operation_type",
                  value: "in",
                },
              ],
              properties: ["id", "from", "to", "businessType"],
            });

            const inventoryBusinessType = await server.getEntityManager<MomInventoryBusinessType>("mom_inventory_business_type").findEntity({
              routeContext,
              filters: [
                {
                  operator: "eq",
                  field: "name",
                  value: "调拨入库",
                },
              ],
              properties: ["id", "operationType"],
            });

            if (inventoryInOperation) {
              const goodTransfer = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntity({
                routeContext,
                filters: [
                  {
                    operator: "eq",
                    field: "id",
                    value: after.id,
                  },
                ],
                properties: ["id", "material", "unit", "good", "quantity", "binNum", "lotNum", "manufactureDate", "validityDate", "lot"],
              });

              if (goodTransfer) {
                let transferInput = {
                  operation: { id: inventoryInOperation.id },
                  good: { id: goodTransfer.good?.id },
                  material: { id: goodTransfer.material?.id },
                  unit: { id: goodTransfer.unit?.id },
                  quantity: goodTransfer.quantity,
                  binNum: goodTransfer.binNum,
                  lotNum: goodTransfer.lotNum,
                  manufactureDate: goodTransfer.manufactureDate,
                  validityDate: goodTransfer.validityDate,
                  lot: { id: goodTransfer.lot?.id },
                  orderNum: 1,
                } as MomGoodTransfer;

                await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").createEntity({
                  routeContext,
                  entity: transferInput,
                });
              }
            } else {
              const goodTransfer = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntity({
                routeContext,
                filters: [
                  {
                    operator: "eq",
                    field: "id",
                    value: after.id,
                  },
                ],
                properties: ["id", "material", "unit", "good", "quantity", "binNum", "lotNum", "manufactureDate", "validityDate", "lot"],
              });

              let inventoryOperationInput = {
                application_id: inventoryOperation.application?.id,
                operationType: inventoryBusinessType?.operationType,
                state: "processing",
                businessType: { id: inventoryBusinessType?.id },
                warehouse: { id: inventoryApplication?.to?.id },
              } as SaveMomInventoryOperationInput;

              // convert goodTransfers to inventoryOperationInput.transfers
              let transfers = [];
              if (goodTransfer) {
                transfers.push({
                  good: { id: goodTransfer.good?.id },
                  material: { id: goodTransfer.material?.id },
                  unit: { id: goodTransfer.unit?.id },
                  quantity: goodTransfer.quantity,
                  binNum: goodTransfer.binNum,
                  lotNum: goodTransfer.lotNum,
                  manufactureDate: goodTransfer.manufactureDate,
                  validityDate: goodTransfer.validityDate,
                  lot: { id: goodTransfer.lot?.id },
                  orderNum: 1,
                } as MomGoodTransfer);
              }

              inventoryOperationInput.transfers = transfers;

              await inventoryOperationManager.createEntity({
                routeContext,
                entity: inventoryOperationInput,
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    eventName: "entity.beforeDelete",
    modelSingularCode: "mom_good_transfer",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeDelete">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const before = payload.before;
      try {
        const operationTarget = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: before.id,
            },
          ],
          properties: ["id", "operation", "material", "binNum", "lotNum"],
        });
        if (ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            routeContext,
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_inspection_sheet",
              targetSingularName: `库存操作记录 - ${operationTarget?.operation?.code} - ${operationTarget?.material?.name} - ${operationTarget?.binNum} - ${operationTarget?.lotNum}`,
              method: "delete",
              before: before,
            },
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    eventName: "entity.delete",
    modelSingularCode: "mom_good_transfer",
    handler: async (ctx: EntityWatchHandlerContext<"entity.delete">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const changes = payload.before;
      try {
        const inventoryOperationManager = server.getEntityManager<MomInventoryOperation>("mom_inventory_operation");

        const inventoryOperation = await inventoryOperationManager.findEntity({
          routeContext,
          filters: [{ operator: "eq", field: "id", value: changes.operation_id }],
          properties: ["id", "application", "businessType", "operationType"],
        });

        let materialAcceptCountMap: MaterialAcceptCountMap = {};
        if (inventoryOperation?.operationType === "in") {
          const goodTransfers = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntities({
            routeContext,
            filters: [{ operator: "eq", field: "operation_id", value: inventoryOperation.id }],
            properties: ["id", "lotNum", "lot", "material", "quantity"],
          });

          for (const goodTransfer of goodTransfers) {
            const materialId = goodTransfer.material?.id;
            const lotNum = goodTransfer.lotNum;

            if (!materialId || !lotNum || !goodTransfer.quantity) continue;

            if (!materialAcceptCountMap[materialId]) {
              materialAcceptCountMap[materialId] = {};
            }

            if (!materialAcceptCountMap[materialId][lotNum]) {
              materialAcceptCountMap[materialId][lotNum] = {
                quantity: 0,
                palletCount: 0,
              };
            }

            materialAcceptCountMap[materialId][lotNum].quantity += goodTransfer.quantity;
            materialAcceptCountMap[materialId][lotNum].palletCount += 1;
          }

          for (const materialId in materialAcceptCountMap) {
            const lotAcceptCountMap = materialAcceptCountMap[materialId];
            for (const lotNum in lotAcceptCountMap) {
              const applicationItems = await server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").findEntities({
                routeContext,
                filters: [
                  { operator: "eq", field: "lotNum", value: lotNum },
                  { operator: "eq", field: "material_id", value: materialId },
                  { operator: "eq", field: "operation_id", value: inventoryOperation?.application?.id },
                ],
                properties: ["id"],
              });

              for (const applicationItem of applicationItems) {
                await server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item").updateEntityById({
                  routeContext,
                  id: applicationItem.id,
                  entityToSave: {
                    acceptQuantity: lotAcceptCountMap[lotNum].quantity,
                    acceptPalletCount: lotAcceptCountMap[lotNum].palletCount,
                  },
                });
              }

              const inspectionSheet = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
                routeContext,
                filters: [
                  { operator: "eq", field: "lotNum", value: lotNum },
                  { operator: "eq", field: "material_id", value: materialId },
                  { operator: "eq", field: "inventory_operation_id", value: inventoryOperation?.id },
                ],
                properties: ["id"],
              });

              if (inspectionSheet) {
                await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").updateEntityById({
                  routeContext,
                  id: inspectionSheet.id,
                  entityToSave: {
                    acceptQuantity: lotAcceptCountMap[lotNum].quantity,
                    acceptPalletCount: lotAcceptCountMap[lotNum].palletCount,
                  },
                });
              }
            }
          }

          if (changes.good_id) {
            const goodManager = server.getEntityManager<MomGood>("mom_good");
            const good = await goodManager.findById({ routeContext, id: changes.good_id });

            if (good) {
              await goodManager.deleteById({ routeContext, id: good.id });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_good_transfer",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const changes = payload.changes;
      const before = payload.before;
      try {
        const operationTarget = await server.getEntityManager<MomGoodTransfer>("mom_good_transfer").findEntity({
          routeContext,
          filters: [
            {
              operator: "eq",
              field: "id",
              value: before.id,
            },
          ],
          properties: ["id", "operation", "material", "binNum", "lotNum", "good"],
        });

        if (changes && ctx?.routerContext?.state.userId) {
          await server.getEntityManager("sys_audit_log").createEntity({
            routeContext,
            entity: {
              user: { id: ctx?.routerContext?.state.userId },
              targetSingularCode: "mom_good_transfer",
              targetSingularName: `库存操作记录 - ${operationTarget?.operation?.code} -物料:${operationTarget?.material?.name} -批号:${operationTarget?.lotNum} -托盘号:${operationTarget?.binNum}`,
              method: "update",
              changes: changes,
              before: before,
            },
          });
        }

        if (changes && changes.hasOwnProperty("quantity")) {
          await server.getEntityManager<MomGood>("mom_good").updateEntityById({
            routeContext,
            id: operationTarget?.good?.id,
            entityToSave: {
              quantity: changes.quantity,
            },
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
] satisfies EntityWatcher<any>[];

async function saveMaterialLotInfo(server: IRpdServer, routeContext: RouteContext, lot: SaveBaseLotInput) {
  if (!lot.lotNum || !lot.material || !lot.material.id) {
    throw new Error("lotNum and material are required when saving lot info.");
  }

  const baseLotManager = server.getEntityManager<BaseLot>("base_lot");
  const lotInDb = await baseLotManager.findEntity({
    routeContext,
    filters: [
      { operator: "eq", field: "lot_num", value: lot.lotNum },
      { operator: "eq", field: "material_id", value: lot.material.id },
    ],
  });

  return lotInDb || (await baseLotManager.createEntity({ routeContext, entity: lot }));
}

async function findOrCreateGood(routeContext: RouteContext, goodManager: EntityManager, input: SaveMomGoodInput) {
  let good = await goodManager.findEntity({
    routeContext,
    filters: [
      { operator: "eq", field: "material_id", value: input.material?.id },
      { operator: "eq", field: "lot_num", value: input.lotNum },
      { operator: "eq", field: "bin_num", value: input.binNum },
    ],
    properties: ["id", "material", "lotNum", "binNum", "quantity", "unit", "lot"],
  });

  if (!good) {
    good = await goodManager.createEntity({ routeContext, entity: input });
    good = await goodManager.findEntity({
      routeContext,
      filters: [{ operator: "eq", field: "id", value: good.id }],
      properties: ["id", "material", "lotNum", "binNum", "quantity", "unit", "lot"],
    });
  }

  return good;
}
