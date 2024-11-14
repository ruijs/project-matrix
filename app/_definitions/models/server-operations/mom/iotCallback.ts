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

        // try {
        //
        //   const iotDBSDK = await new IotDBHelper(server).NewAPIClient();
        //
        //   let queryPayload = {
        //     sql: `select last *
        //           from root.huate.devices.reports.${ workTask.equipment?.machine?.code }
        //           where time > ${ input.activityFields.startTime }
        //             and time < ${ input.activityFields.endTime };`,
        //   }
        //
        //   const tsResponse = await iotDBSDK.PostResourceRequest("http://10.0.0.3:6670/rest/v2/query", queryPayload)
        //   const data = ParseLastDeviceData(tsResponse.data);
        //
        //   for (let deviceCode in data) {
        //
        //     const deviceMetricData = data[deviceCode];
        //     for (let metricCode in deviceMetricData) {
        //       const metricData = deviceMetricData[metricCode];
        //       for (let i = 0; i < metricData.length; i++) {
        //         const item = metricData[i];
        //         const latestTimestamp = item.timestamp;
        //         const latestValue = item.value;
        //         // isOutSpecification
        //         const metricParameter = await server.getEntityManager<MomRouteProcessParameter>("mom_route_process_parameter").findEntity({
        //           filters: [
        //             {
        //               operator: "exists",
        //               field: "dimension",
        //               filters: [{ operator: "eq", field: "code", value: metricCode }]
        //             },
        //             { operator: "eq", field: "process", value: workTask.process?.id },
        //             { operator: "eq", field: "equipment", value: workTask.equipment?.id },
        //           ],
        //           properties: ["id", "upperLimit", "lowerLimit", "nominal", "dimension"],
        //         })
        //
        //
        //         if (!metricParameter) {
        //           continue
        //         }
        //
        //         if (!latestValue) {
        //           continue
        //         }
        //
        //         let isOutSpecification = false;
        //         if (latestValue < (metricParameter?.lowerLimit || 0) + (metricParameter.nominal || 0) || latestValue > (metricParameter?.upperLimit || 0) + (metricParameter.nominal || 0)) {
        //           isOutSpecification = true
        //         }
        //
        //         await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").createEntity({
        //           entity: {
        //             workOrder: workTask.workOrder?.id,
        //             workReport: workReport.id,
        //             process: workTask.process?.id,
        //             equipment: workTask.equipment?.id,
        //             factory: workTask.factory?.id,
        //             value: latestValue,
        //             dimension: metricParameter?.dimension?.id,
        //             upperLimit: metricParameter?.upperLimit,
        //             lowerLimit: metricParameter?.lowerLimit,
        //             nominal: metricParameter?.nominal,
        //             isOutSpecification: isOutSpecification,
        //             createdAt: latestTimestamp,
        //           } as SaveMomRouteProcessParameterMeasurementInput
        //         })
        //       }
        //     }
        //   }
        // } catch (e) {
        //   console.log(e)
        // }
              }
    }

    ctx.output = {}

  },
} satisfies ServerOperation;
