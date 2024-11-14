import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import type {MomWorkFeedTask, MomWorkOrder} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_work_feed_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, payload } = ctx;
      let before = payload.before;

      before.actualStartTime = dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]");
      before.executionState = 'processing';

      const runningTasks = await server.getEntityManager<MomWorkFeedTask>("mom_work_feed_task").findEntities({
        filters: [
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
          before.work_order_id = workOrder.id;
        }
      }

      if (before.hasOwnProperty("processes")) {
        delete before.processes;
      }
    }
  },
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_work_feed_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, payload } = ctx;
      let changes = payload.changes;

      if (changes.hasOwnProperty("actualFinishTime")) {
        changes.executionState = 'completed';
      }
      if (changes.hasOwnProperty("executionState") && changes.executionState === 'completed') {
        changes.actualFinishTime = dayjs().format("YYYY-MM-DDTHH:mm:ss[Z]");
      }
    }
  },
] satisfies EntityWatcher<any>[];
