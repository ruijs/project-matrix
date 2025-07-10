import type {ActionHandlerContext, IRpdServer, ServerOperation} from "@ruiapp/rapid-core";
import {MomWorkReport,} from "~/_definitions/meta/entity-types";
import TimeSeriesDataService from "rapid-plugins/iot/services/TimeSeriesDataService";
import dayjs from "dayjs";
import IotDBHelper, {ParseLastDeviceData, ParseTDEngineData} from "~/sdk/iotdb/helper";

export type QueryInput = {
  workReportId: number;
};

export default {
  code: "test",
  method: "GET",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: QueryInput = ctx.input;

    await test(server, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

async function test(server: IRpdServer, input: QueryInput) {
  const workReport = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntity({
    filters: [
      { operator: "eq", field: "id", value: input?.workReportId },
    ],
    properties: ["id", "factory", "lotNum", "serialNum", "process", "workOrder", "equipment", "actualStartTime", "actualFinishTime", "executionState", "duration"],
    relations: {
      workOrder: {
        properties: ["id", "code", "material", "executionState"]
      },
      process: {
        properties: ["id", "code", "name", "config"]
      },
      equipment: {
        properties: [
          "id", "code", "name", "machine"
        ]
      },
    }
  })
  if (workReport) {
    // workReport.actualStartTime = dayjs("2025-07-06 00:00:00").format("YYYY-MM-DDTHH:mm:ss[Z]");
    // workReport.actualFinishTime = dayjs("2025-07-06 20:00:00").format("YYYY-MM-DDTHH:mm:ss[Z]");
    let data = getDeviceData(server, workReport);
    console.log(data);
  }
}

async function getDeviceData(server: IRpdServer, workReport: MomWorkReport) {
  let data: any = {};

  if (!workReport.equipment?.machine?.code || !workReport.actualStartTime || !workReport.actualFinishTime) {
    return data;
  }

  // 长春设备 - 使用TDEngine
  if (workReport.process?.code === "32" || workReport.process?.code === "33" || workReport.process?.code === "34") {
    const timeSeriesDataService = server.getService<TimeSeriesDataService>("timeSeriesDataService");

    let startTime: number;
    let endTime: number;

    if (workReport.process?.code === "32") {
      // 工序32需要减去2分钟
      startTime = (dayjs(workReport.actualStartTime).unix()) * 1000;
      endTime = (dayjs(workReport.actualFinishTime).add(-2, "minutes").unix()) * 1000;
    } else {
      // 工序33、34使用标准时间
      startTime = dayjs(workReport.actualStartTime).unix() * 1000;
      endTime = dayjs(workReport.actualFinishTime).unix() * 1000;
    }

    const tsResponse = await timeSeriesDataService.getDeviceData(workReport.equipment.machine.code, startTime, endTime);
    console.log("TDEngine tsResponse", tsResponse);
    data = ParseTDEngineData(tsResponse, workReport.equipment.machine.code);
    console.log("data", data);

  } else {
    // 其他设备 - 使用IotDB
    const iotDBSDK = await new IotDBHelper(server).NewAPIClient();
    let input = {
      sql: `select last *
            from root.huate.devices.reports.${workReport.equipment?.machine?.code}
            where time >= ${(dayjs(workReport.actualStartTime).unix()) * 1000}
              and time <= ${(dayjs(workReport.actualFinishTime).unix()) * 1000}`,
    }

    // 发泡工序需要减去2分钟
    if (workReport.process?.code === "12" || workReport.process?.code === "21") {
      input = {
        sql: `select last *
              from root.huate.devices.reports.${workReport.equipment?.machine?.code}
              where time >= ${(dayjs(workReport.actualStartTime).unix()) * 1000}
                and time <= ${(dayjs(workReport.actualFinishTime).add(-2, "minutes").unix()) * 1000}`,
      }
    }

    const tsResponse = await iotDBSDK.PostResourceRequest("http://10.0.0.3:6670/rest/v2/query", input, true)
    data = ParseLastDeviceData(tsResponse.data);
  }

  return data;
}
