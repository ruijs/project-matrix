import { tryValidateLicense, type ActionHandlerContext, type CronJobConfiguration } from "@ruiapp/rapid-core";
import type { MomMaterialInventoryBalance, MomRouteProcessParameterMeasurement, SystemSettingItem, MomWorkReport } from "~/_definitions/meta/entity-types";
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
    // return;
    const { server, logger } = ctx;
    logger.info("Executing uploadHuateMeasurements job...");

    if (!tryValidateLicense(logger, server)) {
      throw new Error("无法上报检验记录到宜搭。");
    }

    const yidaSDK = await new YidaHelper(server).NewAPIClient();
    const yidaAPI = new YidaApi(logger, yidaSDK);

    const yidaSetting = await server.getEntityManager<SystemSettingItem>("system_setting_item").findEntity({
      filters: [
        { operator: "eq", field: "groupCode", value: "yida" },
        { operator: "eq", field: "itemCode", value: "apiThrottlingDelay" },
      ],
      properties: ["value"],
    });

    while (true) {
      try {
        const measurements = await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").findEntities({
          filters: [
            { operator: "eq", field: "isReported", value: false },
            { operator: "lt", field: "retryTimes", value: 3 },
          ],
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
            "retryTimes",
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
            limit: 50,
          },
        });

        if (!measurements.length) {
          break;
        }

        // let notifyEnabled = false;
        // let isOutSpecification = false;

        for (const measurement of measurements) {
          await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").updateEntityById({
            id: measurement.id,
            entityToSave: {
              retryTimes: (measurement.retryTimes || 0) + 1,
            },
          });

          // await yidaAPI.uploadProductionMeasurement(measurement);
          await yidaAPI.uploadFAWProcessMeasurement(measurement);

          await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").updateEntityById({
            id: measurement.id,
            entityToSave: {
              isReported: true,
            },
          });

          const waitTime = yidaSetting?.value ? Number(yidaSetting.value) : 1000;
          await waitSeconds(waitTime);
          // if (measurement.process?.config?.notifyEnabled) {
          //   notifyEnabled = true;
          // }

          // if (measurement.isOutSpecification) {
          //   isOutSpecification = true;
          // }
        }

        await waitSeconds(1000 * 10);

        // if (isOutSpecification && notifyEnabled) {
        //   await yidaAPI.uploadProductionMeasurementsAudit(measurements);
        // }
      } catch (e: any) {
        logger.error("uploadHuateMeasurements failed." + e.message);
        console.log(e);
      }
    }

    logger.info("Finished uploadHuateMeasurements job...");
  },
} satisfies CronJobConfiguration;
