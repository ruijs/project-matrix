import type {EntityWatcher, EntityWatchHandlerContext, IRpdServer} from "@ruiapp/rapid-core";
import type {
  BaseLot,
  MomProcess,
  MomWorkFeed, MomWorkFeedTask,
  MomWorkOrder,
  MomWorkTask,
  SaveBaseLotInput,
  SaveMomWorkTaskInput
} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_work_order",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, payload } = ctx;
      const { before } = payload;

      // 判断当前是否有正在运行中的工单，报错提示已经有正在运行中的工单
      const workOrderManager = server.getEntityManager<MomWorkOrder>("mom_work_order");
      const workOrder = await workOrderManager.findEntity({
        filters: [
          {
            operator: "exists",
            field: "processes",
            filters: [{ operator: "in", field: "id", value: before.processes }]
          },
          { operator: "eq", field: "executionState", "value": "processing" },
        ],
        properties: ["id"]
      });

      if (workOrder) {
        throw new Error("当前设备已有正在运行中的工单,请完成后再创建工单。");
      }

      try {
        const processes = await server.getEntityManager<MomProcess>("mom_process").findEntities({
          filters: [
            { operator: "in", field: "id", value: before.processes },
          ],
          properties: ["id", "factory", "config"]
        });

        if (processes && processes.length > 0) {
          if (processes[0] && processes[0].factory) {
            before.factory_id = processes[0].factory?.id
          }
        }

        if (before.hasOwnProperty('lotNum')) {
          const lot = await saveMaterialLotInfo(server, {
            lotNum: before.lotNum,
            material: { "id": before.material?.id || before.material || before.material_id },
            sourceType: "selfMade",
            qualificationState: "qualified",
            isAOD: false,
            state: "normal",
          } as SaveBaseLotInput);
          if (lot) {
            before.lot = { id: lot?.id };
          }
        }

        for (const process of processes) {
          if (!before.hasOwnProperty('lotNum') && process?.config?.taskLotNumAutoGenerate) {
            const lot = await saveMaterialLotInfo(server, {
              material: { id: before?.material?.id || before?.material },
              sourceType: "selfMade",
              qualificationState: "qualified",
              isAOD: false,
              state: "normal",
            });
            if (lot) {
              before.lot = { id: lot.id };
              before.lotNum = lot.lotNum;
            }
            break;
          }
        }

      } catch (error) {
        console.error(error);
      }

      if ((before.hasOwnProperty("equipment") || before.hasOwnProperty("equipment_id")) && (before.hasOwnProperty("processes"))) {
        await server.getEntityManager<MomWorkTask>("mom_work_task").createEntity(
          {
            entity: {
              processes: before.processes,
              equipment: { id: before.equipment.id || before.equipment || before.equipment_id },
            } as SaveMomWorkTaskInput,
          }
        )
      }

      if (before.hasOwnProperty("equipment")) {
        delete before.equipment;
      }
      if (before.hasOwnProperty("equipment_id")) {
        delete before.equipment_id;
      }

      before.actualStartDate = dayjs().format("YYYY-MM-DD");
    },
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_work_order",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;
      const { after } = payload;


      try {

        const workOrderManager = server.getEntityManager<MomWorkOrder>("mom_work_order");
        const workOrder = await workOrderManager.findEntity({
          filters: [
            {
              operator: "eq",
              field: "id",
              value: after.id
            }
          ],
          properties: ["id", "processes", "code", "lotNum", "quantity", "factory", "material", "oilMixtureRatio", "paraffinQuantity", "stirringTime", "stirringPressure", "tankNumber", "unloadingVideo", "dcsPicture", "createdBy"]
        });

        const processIds = workOrder?.processes.map((process: MomProcess) => process.id);

        const workFeedTasks = await server.getEntityManager<MomWorkFeedTask>("mom_work_feed_task").findEntities({
          filters: [
            { operator: "in", field: "process_id", value: processIds },
            { operator: "null", field: "workOrder" },
          ],
        });

        if (workFeedTasks) {
          for (const workFeedTask of workFeedTasks) {
            await server.getEntityManager<MomWorkFeedTask>("mom_work_feed_task").updateEntityById(
              {
                id: workFeedTask.id,
                entityToSave: {
                  workOrder: { id: after.id },
                }
              }
            )
          }
        }


        const workTasks = await server.getEntityManager<MomWorkTask>("mom_work_task").findEntities({
          filters: [
            { operator: "in", field: "process_id", value: processIds },
            { operator: "null", field: "workOrder" },
          ],
        });

        if (workTasks) {
          for (const workTask of workTasks) {
            await server.getEntityManager<MomWorkTask>("mom_work_task").updateEntityById(
              {
                id: workTask.id,
                entityToSave: {
                  workOrder: { id: after.id },
                }
              }
            )
          }
        }

        const workFeedManager = server.getEntityManager<MomWorkFeed>("mom_work_feed");
        const workFeeds = await workFeedManager.findEntities({
          filters: [
            { operator: "in", field: "process_id", value: processIds },
            // {
            //   operator: "eq",
            //   field: "equipment_id",
            //   value: after.equipment.id || after.equipment || after.equipment_id
            // },
            { operator: "null", field: "workOrder" },
          ],
        });
        if (workFeeds) {
          for (const workFeed of workFeeds) {
            await workFeedManager.updateEntityById(
              {
                id: workFeed.id,
                entityToSave: {
                  workOrder: { id: after.id },
                }
              }
            )
          }
        }


      } catch (error) {
        console.error(error);
      }
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_work_order",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, payload } = ctx;
      const { after, changes } = payload;


      try {

        if (changes.hasOwnProperty("executionState") && changes.executionState === "completed") {
          const workOrderManager = server.getEntityManager<MomWorkOrder>("mom_work_order");
          const workOrder = await workOrderManager.findEntity({
            filters: [
              {
                operator: "eq",
                field: "id",
                value: after.id
              }
            ],
            properties: ["id", "processes", "code", "lotNum", "quantity", "factory", "material", "oilMixtureRatio", "paraffinQuantity", "stirringTime", "stirringPressure", "tankNumber", "unloadingVideo", "dcsPicture", "createdBy"]
          });

          if (workOrder?.material?.code === "ITEM003" || workOrder?.material?.name === "石蜡油") {
            const workFeedManager = server.getEntityManager<MomWorkFeed>("mom_work_feed");
            const workFeeds = await workFeedManager.findEntities({
              filters: [
                { operator: "eq", field: "work_order_id", value: after.id },
              ],
              properties: ["id", "workOrder", "rawMaterial", "quantity", "lotNum", "process", "equipment", "instoreTankNumber", "oilMixtureRatio1", "oilMixtureRatio2"],
              relations: {
                workOrder: {
                  properties: ["id", "processes", "code", "lotNum", "quantity", "factory", "material", "oilMixtureRatio", "paraffinQuantity", "stirringTime", "stirringPressure", "tankNumber", "unloadingVideo", "dcsPicture", "createdBy"]
                }
              }
            });


            const yidaSDK = await new YidaHelper(server).NewAPIClient();
            const yidaAPI = new YidaApi(yidaSDK);

            if (workFeeds) {
              // 泰洋圣上报宜搭
              await yidaAPI.uploadTYSProductionRecords(workFeeds)
            }

            if (workOrder) {
              workOrder.feeds = workFeeds
              await yidaAPI.uploadFAWTYSProductionMeasurement(workOrder)
            }
          }

        }

      } catch (error) {
        console.error(error);
      }
    },
  },
] satisfies EntityWatcher<any>[];

async function saveMaterialLotInfo(server: IRpdServer, lot: SaveBaseLotInput) {
  if (!lot.material || !lot.material.id) {
    throw new Error("material are required when saving lot info.");
  }

  const baseLotManager = server.getEntityManager<BaseLot>("base_lot");
  return await baseLotManager.createEntity({ entity: lot })
}

async function getOrSaveMaterialLotInfo(server: IRpdServer, lot: SaveBaseLotInput) {
  if (!lot.lotNum || !lot.material || !lot.material.id) {
    throw new Error("lotNum and material are required when saving lot info.");
  }

  const baseLotManager = server.getEntityManager<BaseLot>("base_lot");
  const lotInDb = await baseLotManager.findEntity({
    filters: [
      { operator: "eq", field: "lot_num", value: lot.lotNum },
      { operator: "eq", field: "material_id", value: lot.material.id },
    ],
  });

  return lotInDb || (await baseLotManager.createEntity({ entity: lot }));
}
