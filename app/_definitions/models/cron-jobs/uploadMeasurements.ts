import type { ActionHandlerContext, CronJobConfiguration } from "@ruiapp/rapid-core";
import type { MomMaterialInventoryBalance, MomRouteProcessParameterMeasurement, MomWorkReport } from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";
import { waitSeconds } from "~/utils/promise-utility";

export default {
  code: "uploadHuateMeasurements",

  cronTime: "*/2 * * * *",

  jobOptions: {
    waitForCompletion: true,
  },

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing uploadHuateMeasurements job...");

    const yidaSDK = await new YidaHelper(server).NewAPIClient();
    const yidaAPI = new YidaApi(yidaSDK);

    while (true) {
      try {
        const measurements = await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").findEntities({
          filters: [{ operator: "eq", field: "isReported", value: false }],
          properties: [
            "id",
            "process",
            "equipment",
            "workOrder",
            "upperLimit",
            "lowerLimit",
            "nominal",
            "value",
            "isOutSpecification",
            "dimension",
            "workReport",
            "fawCode",
            "createdAt",
          ],
          relations: {
            workOrder: {
              properties: ["id", "factory", "material", "process", "code", "process", "equipment", "createdBy"],
            },
          },
          orderBy: [
            {
              field: "id",
              desc: true,
            },
          ],
          pagination: {
            offset: 0,
            limit: 100,
          },
        });

        if (!measurements.length) {
          break;
        }

        let notifyEnabled = false;

        let isOutSpecification = false;
        for (const measurement of measurements) {
          await yidaAPI.uploadProductionMeasurement(measurement);
          await yidaAPI.uploadFAWProcessMeasurement(measurement);

          await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").updateEntityById({
            id: measurement.id,
            entityToSave: {
              isReported: true,
            },
          });
          await waitSeconds(100);

          if (measurement.process?.config?.notifyEnabled) {
            notifyEnabled = true;
          }

          if (measurement.isOutSpecification) {
            isOutSpecification = true;
          }
        }

        if (isOutSpecification && notifyEnabled) {
          await yidaAPI.uploadProductionMeasurementsAudit(measurements);
        }
      } catch (e: any) {
        logger.error("uploadHuateMeasurements failed." + e.message);
        console.log(e);
      }
    }

    logger.info("Finished uploadHuateMeasurements job...");
  },
} satisfies CronJobConfiguration;
