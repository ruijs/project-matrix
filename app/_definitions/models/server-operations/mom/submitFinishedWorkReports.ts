import type {ActionHandlerContext, ServerOperation} from "@ruiapp/rapid-core";
import {MomWorkReport} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";

export type SubmitFinishedWorkReportsInput = {
  workOrder: number;
  process: number;
  equipment: number;
  from: number;
  to: number;
};

export default {
  code: "submitFinishedWorkReports",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: SubmitFinishedWorkReportsInput = ctx.input;

    const fromWorkReport = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntity({
      filters: [
        {
          operator: "eq",
          field: "process_id",
          value: input.process
        },
        {
          operator: "eq",
          field: "id",
          value: input.from
        },
      ],
      properties: ["id", "createdAt", "lot", "actualStartTime"]
    });

    const toWorkReport = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntity({
      filters: [
        {
          operator: "eq",
          field: "process_id",
          value: input.process
        },
        {
          operator: "eq",
          field: "id",
          value: input.to
        },
      ],
      properties: ["id", "createdAt", "lot", "actualStartTime"]
    });

    if (!fromWorkReport || !toWorkReport) {
      throw new Error("开始批号或结束批号不存在");
    }

    let timeFrom = fromWorkReport.createdAt
    let timeTo = toWorkReport.createdAt

    if (dayjs(fromWorkReport.createdAt).isAfter(dayjs(toWorkReport.createdAt))) {
      timeFrom = toWorkReport.createdAt
      timeTo = fromWorkReport.createdAt
    }

    const workReports = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntities({
      filters: [
        {
          operator: "eq",
          field: "process_id",
          value: input.process
        },
        {
          operator: "gte",
          field: "actual_start_time",
          value: timeFrom
        },
        {
          operator: "lte",
          field: "actual_start_time",
          value: timeTo
        }
      ],
      properties: ["id", "createdAt", "process", "actualStartTime"]
    });


    for (const workReport of workReports) {
      switch (workReport.process?.name) {
        case "通风工序":
          // 判断workReport.actualStartTime是否满足72H
          if (!workReport.actualStartTime) {
            throw new Error("通风开始时间为空");
          }

          if (dayjs().diff(dayjs(workReport.actualStartTime), "hour") < 72) {
            throw new Error("通风时间不满足72H");
          }
          break;
        case "烘烤工序":
          if (!workReport.actualStartTime) {
            throw new Error("烘烤开始时间为空");
          }

          if (dayjs().diff(dayjs(workReport.actualStartTime), "hour") < 4) {
            throw new Error("烘烤时间不满足4H");
          }
          break;
      }

    }

    for (const workReport of workReports) {
      await server.getEntityManager<MomWorkReport>("mom_work_report").updateEntityById({
        id: workReport.id,
        entityToSave: {
          actualFinishTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          executionState: "completed",
        }
      })
    }


    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;