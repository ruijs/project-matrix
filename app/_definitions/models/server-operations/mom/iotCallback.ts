import type {ActionHandlerContext, ServerOperation} from "@ruiapp/rapid-core";
import type {
  MomRouteProcessParameter,
  MomRouteProcessParameterMeasurement,
  MomWorkReport,
  MomWorkTask,
  SaveMomRouteProcessParameterMeasurementInput
} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import IotDBHelper, {ParseDeviceData, ParseLastDeviceData} from "~/sdk/iotdb/helper";

export type CallbackInput = {
  machine: any,
  activityFields: any
  runtimeFields: any
  attributeFields: any
};

export default {
  code: "iotCallback",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: CallbackInput = ctx.input;


    if (input.activityFields.workTask) {
      const workTask = await server.getEntityManager<MomWorkTask>("mom_work_task").findEntity({
        filters: [
          { operator: "eq", field: "code", value: input.activityFields.workTask },
        ],
        properties: ["id", "workOrder", "process", "material", "equipment"],
        relations: {
          equipment: {
            properties: [
              "id", "code", "name", "machine"
            ]
          }
        }
      })

      const duration = input.activityFields.duration / 1000

      if (workTask && input.activityFields.state !== "running") {
        let workReport = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntity({
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
              actualStartTime: dayjs(input.activityFields.startTime),
              actualFinishTime: dayjs(input.activityFields.endTime),
              duration: duration,
              state: "completed",
            }
          })
        } else {
          workReport = await server.getEntityManager<MomWorkReport>("mom_work_report").createEntity({
            entity: {
              workOrder: workTask.workOrder,
              workTask: { id: workTask.id },
              process: workTask.process,
              equipment: workTask.equipment,
              material: workTask.material,
              actualStartTime: dayjs(input.activityFields.startTime),
              actualFinishTime: dayjs(input.activityFields.endTime),
              duration: duration,
              state: "completed",
            }
          })
        }
      }
    }

    ctx.output = {}

  },
} satisfies ServerOperation;
