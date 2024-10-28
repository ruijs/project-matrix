import type {ActionHandlerContext, ServerOperation} from "@ruiapp/rapid-core";
import type {MomRouteProcessParameterMeasurement, MomWorkReport, MomWorkTask} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";

export type CallbackInput = {
  machine: any,
  runtimeFields: any
  activityFields: any
  attributeFields: any
};

export default {
  code: "iotCallback",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: CallbackInput = ctx.input;


    if (input.runtimeFields.workTask) {
      const workTask = await server.getEntityManager<MomWorkTask>("mom_work_task").findEntity({
        filters: [
          { operator: "eq", field: "code", value: input.runtimeFields.workTask },
        ],
        properties: ["id", "workOrder", "process", "material", "equipment"],
      })

      if (workTask && input.runtimeFields.state !== "running") {
        const workReport = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntity({
          filters: [
            { operator: "eq", field: "workOrder", value: workTask.workOrder },
            { operator: "eq", field: "process", value: workTask.process },
            { operator: "eq", field: "equipment", value: workTask.equipment },
            { operator: "eq", field: "executionState", value: "processing" },
          ],
          properties: ["id", "workOrder", "process", "material", "equipment"],
        })

        if (workReport) {
          await server.getEntityManager<MomWorkReport>("mom_work_report").updateEntityById({
            id: workReport.id,
            entityToSave: {
              actualStartTime: dayjs(input.runtimeFields.startTime).format("YYYY-MM-DD HH:mm:ss"),
              actualFinishTime: dayjs(input.runtimeFields.endTime).format("YYYY-MM-DD HH:mm:ss"),
              duration: input.runtimeFields.duration,
              state: "completed",
            }
          })
        } else {
          await server.getEntityManager<MomWorkReport>("mom_work_report").createEntity({
            entity: {
              workOrder: workTask.workOrder,
              workTask: { id: workTask.id },
              process: workTask.process,
              equipment: workTask.equipment,
              material: workTask.material,
              actualStartTime: dayjs(input.runtimeFields.startTime).format("YYYY-MM-DD HH:mm:ss"),
              actualFinishTime: dayjs(input.runtimeFields.endTime).format("YYYY-MM-DD HH:mm:ss"),
              duration: input.runtimeFields.duration,
              state: "completed",
            }
          })
        }
      }

      for (const attribute of input.attributeFields) {
        // TODO: 处理数采数据

        // await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").createEntity({})
      }

    }


  },
} satisfies ServerOperation;
