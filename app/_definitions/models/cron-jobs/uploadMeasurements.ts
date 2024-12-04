import type {ActionHandlerContext, CronJobConfiguration} from "@ruiapp/rapid-core";
import type {
  MomMaterialInventoryBalance,
  MomRouteProcessParameterMeasurement,
  MomWorkReport
} from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default {
  code: "uploadHuateMeasurements",

  cronTime: "*/2 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing uploadHuateMeasurements job...");

    try {
      const measurements = await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").findEntities({
        filters: [{ operator: "eq", field: "isReported", value: false }],
        properties: ["id", "process", "equipment", "workOrder", "upperLimit", "lowerLimit", "nominal", "value", "isOutSpecification", "dimension", "workReport", "fawCode"],
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
          await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").updateEntityById({
            id: measurement.id,
            entityToSave: {
              isReported: true,
            }
          })

          if (measurement.process?.config?.notifyEnabled) {
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

    logger.info("Finished uploadHuateMeasurements job...");
  },
} satisfies CronJobConfiguration;
