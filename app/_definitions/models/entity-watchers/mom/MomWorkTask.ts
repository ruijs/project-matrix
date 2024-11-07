import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import type {MomWorkOrder, MomWorkTask, SaveMomWorkOrderInput} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import IotHelper from "~/sdk/iot/helper";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_work_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, payload } = ctx;
      let before = payload.before;

      before.actualStartTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
      before.executionState = 'processing';

      if (before.hasOwnProperty('processes') && !before.hasOwnProperty('process')) {
        if (before.processes.length > 0) {
          before.process = before.processes[0];
        }
      }

      if (before.hasOwnProperty('process') && !before.hasOwnProperty('processes')) {
        before.processes = [before?.process?.id || before?.process || before.process_id];
      }

      if (!before.hasOwnProperty("workOrder") && !before.hasOwnProperty("work_order_id")) {
        const workOrderManager = server.getEntityManager<MomWorkOrder>("mom_work_order");
        const workOrder = await workOrderManager.findEntity({
          filters: [
            {
              operator: "exists",
              field: "processes",
              filters: [{ operator: "in", field: "id", value: before.processes }]
            },
            { operator: "eq", field: "executionState", value: 'processing' },
          ],
        });
        if (workOrder) {
          const runningTasks = await server.getEntityManager<MomWorkTask>("mom_work_task").findEntities({
            filters: [
              { operator: "eq", field: "work_order_id", value: workOrder.id },
              {
                operator: "eq",
                field: "process_id",
                value: before?.process?.id || before?.process || before.process_id
              },
              { operator: "eq", field: "executionState", value: 'processing' },
            ],
          })
          if (runningTasks.length > 0) {
            throw new Error("工单任务正在执行中");
          }
          before.work_order_id = workOrder.id;
        } else {
          const workOrder = await workOrderManager.createEntity({
            entity: {
              processes: before.processes,
              material: { id: before.material.id || before.material || before.material_id },
              executionState: 'processing',
            } as SaveMomWorkOrderInput,
          });
          if (workOrder) {
            before.work_order_id = workOrder.id;
          }
        }
      }

      if (before.hasOwnProperty("processes")) {
        delete before.processes;
      }
    }
  },
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_work_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, payload } = ctx;
      let changes = payload.changes;

      if (changes.hasOwnProperty("actualFinishTime")) {
        changes.executionState = 'completed';
      }
      if (changes.hasOwnProperty("executionState") && changes.executionState === 'completed') {
        changes.actualFinishTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
      }
    }
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_work_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;
      let after = payload.after;

      const workTask = await server.getEntityManager<MomWorkTask>("mom_work_task").findEntity({
        filters: [
          { operator: "eq", field: "id", value: after.id },
        ],
        properties: ["id", "code", "workOrder", "process", "material", "equipment"],
      })

      if (!workTask) {
        return;
      }


      try {
        if(workTask?.equipment?.externalId) {
          let deviceTaskPayload = {
            workTask: workTask.code,
          };

          const iotSDK = await new IotHelper(server).NewAPIClient();
          await iotSDK.PutResourceRequest(`http://10.0.0.3:3020/api/machines/${ workTask?.equipment?.externalId }/fields`, deviceTaskPayload);
        }
      } catch (e) {
        console.log(e)
      }

    }
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_work_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, payload } = ctx;
      let { before, changes } = payload;


      if (changes.hasOwnProperty("executionState") && changes.executionState === "completed") {

        const workTask = await server.getEntityManager<MomWorkTask>("mom_work_task").findEntity({
          filters: [
            { operator: "eq", field: "id", value: before.id },
          ],
          properties: ["id", "code", "workOrder"],
          relations: {
            workOrder: {
              properties: ["id", "processes"],
            }
          }
        })

        let needFinish = false;
        if (workTask?.workOrder) {
          if (workTask?.workOrder.processes && workTask?.workOrder?.processes.length === 1) {
            needFinish = true; // needFinish
          }
        }


        if (workTask && workTask?.workOrder && needFinish) {
          const workOrderManager = server.getEntityManager<MomWorkOrder>("mom_work_order");
          await workOrderManager.updateEntityById({
            id: workTask.workOrder.id,
            entityToSave: {
              executionState: 'completed',
              actualFinishDate: dayjs().format("YYYY-MM-DD"),
            }
          })
        }


        if(workTask?.equipment?.externalId) {
          let deviceTaskPayload = {
            workTask: "",
            state: "stopped",
          };

          const iotSDK = await new IotHelper(server).NewAPIClient();
          await iotSDK.PutResourceRequest(`http://10.0.0.3:3020/api/machines/${ workTask?.equipment?.externalId }/fields`, deviceTaskPayload);
        }
      }
    }
  },
] satisfies EntityWatcher<any>[];
