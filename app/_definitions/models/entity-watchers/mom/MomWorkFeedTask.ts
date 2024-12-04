import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import type {
  MomRouteProcessParameter,
  MomRouteProcessParameterMeasurement,
  MomWorkFeedTask,
  MomWorkOrder, SaveMomRouteProcessParameterMeasurementInput
} from "~/_definitions/meta/entity-types";
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
  {
    eventName: "entity.create",
    modelSingularCode: "mom_work_feed_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;
      let after = payload.after;

      const tasks = await server.getEntityManager<MomWorkFeedTask>("mom_work_feed_task").findEntities({
        filters: [
          {
            operator: "eq",
            field: "process_id",
            value: after?.process?.id || after?.process || after.process_id
          },
        ],
        properties: ["id", "process", "equipment", "workOrder", "actualStartTime"],
        orderBy: [{ field: "id", desc: true }],
        pagination: { limit: 2, offset: 0 },
      })

      let latestValue: any;
      if (tasks.length === 2) {
        latestValue = dayjs.duration(dayjs(tasks[0].actualStartTime).diff(dayjs(tasks[1].actualStartTime))).asHours();
      }

      if (latestValue) {
        const workFeedTask = tasks[0];
        const metricParameter = await server.getEntityManager<MomRouteProcessParameter>("mom_route_process_parameter").findEntity({
          filters: [
            {
              operator: "exists",
              field: "dimension",
              filters: [{ operator: "eq", field: "code", value: "baking_time" }]
            },
            { operator: "eq", field: "process", value: tasks[0].process?.id },
            { operator: "eq", field: "equipment", value: tasks[0].equipment?.id },
          ],
          properties: ["id", "upperLimit", "lowerLimit", "nominal", "dimension", "fawCode"],
        })

        if (!metricParameter) {
          console.log("metricParameter not found");
          return
        }

        let isOutSpecification = false;
        if (metricParameter?.lowerLimit && (latestValue < (metricParameter?.lowerLimit || 0) + (metricParameter.nominal || 0))) {
          isOutSpecification = true
        }
        if (metricParameter?.upperLimit && latestValue > (metricParameter?.upperLimit || 0) - (metricParameter.nominal || 0)) {
          isOutSpecification = true
        }

        await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").createEntity({
          entity: {
            workOrder: workFeedTask.workOrder?.id,
            process: workFeedTask.process?.id,
            equipment: workFeedTask.equipment?.id,
            factory: workFeedTask.factory?.id,
            value: latestValue,
            dimension: metricParameter?.dimension?.id,
            upperLimit: metricParameter?.upperLimit,
            lowerLimit: metricParameter?.lowerLimit,
            nominal: metricParameter?.nominal,
            fawCode: metricParameter?.fawCode,
            isOutSpecification: isOutSpecification,
            createdAt: dayjs(),
          } as SaveMomRouteProcessParameterMeasurementInput
        })
      }

    }
  },
] satisfies EntityWatcher<any>[];
