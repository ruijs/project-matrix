import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import type {MomRouteProcessParameterMeasurement} from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default [
  {
    eventName: "entity.create",
    modelSingularCode: "mom_route_process_parameter_measurement",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;
      const after = payload.after;

      //   TODO: 处理注塑超差提交到钉钉

      try {
        const measurements = await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").findEntities({
          filters: [{ operator: "eq", field: "id", value: after.id }],
          properties: ["id", "process", "equipment", "workOrder", "upperLimit", "lowerLimit", "nominal", "value", "isOutSpecification", "dimension", "workReport"],
          relations: {
            workOrder: {
              properties: ["id", "factory", "material", "process", "code", "process", "equipment", "createdBy"]
            }
          }
        });

        let notifyEnabled = false;

        const yidaSDK = await new YidaHelper(server).NewAPIClient();
        const yidaAPI = new YidaApi(yidaSDK);

        await yidaAPI.uploadProductionMeasurements(measurements)

        await yidaAPI.uploadFAWProcessMeasurement(measurements)

        if (measurements) {
          let isOutSpecification = false
          for (const measurement of measurements) {

            if (measurement.process?.config?.notifyEnabled)  {
              notifyEnabled = true
            }

            if (measurement.isOutSpecification) {
              isOutSpecification = true
            }
          }
          if (isOutSpecification && notifyEnabled) {
            await yidaAPI.uploadProductionMeasurementsAudit(measurements)
          }
        }


      } catch (e) {
        console.log(e)
      }

    }
  },
] satisfies EntityWatcher<any>[];
