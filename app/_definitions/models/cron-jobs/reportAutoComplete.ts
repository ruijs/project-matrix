import type {ActionHandlerContext, CronJobConfiguration} from "@ruiapp/rapid-core";
import type PrinterService from "rapid-plugins/printerService/PrinterService";
import type {MomWorkReport} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";

export default {
  code: "reportAutoComplete",

  cronTime: "*/1 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    logger.info("Executing reportAutoComplete job...");

    // 发泡工序
    const workReports = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntities({
      filters: [
        {
          operator: "exists",
          field: "process",
          filters: [
            {
              operator: "or",
              filters: [
                { operator: "eq", field: "code", value: "12" }, 
                { operator: "eq", field: "code", value: "21" },
                { operator: "eq", field: "code", value: "32" },
              ],
            },
          ]
        },
        {
          operator: "ne",
          field: "executionState",
          value: "completed"
        }
      ],
      properties: ["id", "factory", "process", "workOrder", "material", "equipment", "actualStartTime", "actualFinishTime", "executionState"],
      relations: {
        workOrder: {
          properties: ["id", "code", "material", "executionState"]
        },
        process: {
          properties: ["id", "code", "name", "config"]
        }
      }
    })

    if (workReports) {
      for (const workReport of workReports) {
        // check if actualStartTime is before 3 minutes
        if (workReport.actualStartTime && dayjs(workReport.actualStartTime).add(5, "minute").isBefore(dayjs())) {
          await server.getEntityManager<MomWorkReport>("mom_work_report").updateEntityById({
            id: workReport.id,
            entityToSave: {
              actualFinishTime: dayjs(),
              executionState: "completed"
            }
          });
        }
      }
    }

    logger.info("Finished reportAutoComplete job...");
  },
} satisfies CronJobConfiguration;
