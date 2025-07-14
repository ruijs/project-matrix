import { tryValidateLicense, type ActionHandlerContext, type CronJobConfiguration } from "@ruiapp/rapid-core";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";
import { waitSeconds } from "~/utils/promise-utility";
// 测试输入参数类型
export type QueryInput = {
  batchSize?: number; // 批次大小
  measurementId?: number; // 特定测量ID
  simulateError?: boolean; // 是否模拟错误
};

// 服务器操作定义
export default {
  code: "testUploadMeasurements",
  method: "GET",
  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    const input: QueryInput = ctx.input;

    // 执行测试上传逻辑
    const result = await testUploadMeasurements(server, logger, input);

    ctx.output = {
      success: result.success,
      message: result.message,
      uploadedCount: result.uploadedCount,
      error: result.error,
    };
  },
} satisfies Record<string, any>;

/**
 * 测试测量数据上传逻辑
 */
async function testUploadMeasurements(server: any, logger: any, input: QueryInput) {
  try {
    const yidaSDK = await new YidaHelper(server).NewAPIClient();
    const yidaAPI = new YidaApi(yidaSDK);
    var uploadedCount = 0;

    // 查询测试数据
    const measurements = await getTestMeasurements(server, input);

    if (!measurements.length) {
      return { success: true, message: "无测试数据", uploadedCount: 0 };
    }

    // 模拟上传流程
    for (const measurement of measurements) {
      // 模拟错误场景
      if (input.simulateError) {
        throw new Error("模拟上传失败");
      }

      // 更新重试次数
      await server.getEntityManager("mom_route_process_parameter_measurement").updateEntityById({
        id: measurement.id,
        entityToSave: {
          retryTimes: (measurement.retryTimes || 0) + 1,
        },
      });

      // 调用上传API
      await yidaAPI.uploadFAWProcessMeasurement(measurement);

      // 更新上报状态
      await server.getEntityManager("mom_route_process_parameter_measurement").updateEntityById({
        id: measurement.id,
        entityToSave: {
          isReported: true,
        },
      });

      uploadedCount++;
      await waitSeconds(5000); // 模拟5秒间隔
    }

    return {
      success: true,
      message: `成功上传${uploadedCount}条数据`,
      uploadedCount,
    };
  } catch (e: any) {
    logger.error(`测试上传失败: ${e.message}`);
    return {
      success: false,
      message: e.message,
      uploadedCount: 0,
      error: e.stack,
    };
  }
}

/**
 * 获取测试用测量数据
 */
async function getTestMeasurements(server: any, input: QueryInput) {
  const filters = [
    { operator: "eq", field: "isReported", value: false },
    { operator: "lt", field: "retryTimes", value: 3 },
  ];

  // 如果指定了测量ID，则只查询该条数据
  if (input.measurementId) {
    filters.push({ operator: "eq", field: "id", value: input.measurementId });
  }

  return server.getEntityManager("mom_route_process_parameter_measurement").findEntities({
    filters,
    properties: ["id", "process", "equipment", "workOrder", "value", "retryTimes"],
    relations: { workOrder: { properties: ["id", "code", "material"] } },
    pagination: { offset: 0, limit: input.batchSize || 1 },
  });
}
