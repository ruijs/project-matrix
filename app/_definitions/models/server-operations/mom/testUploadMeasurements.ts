import { tryValidateLicense, type ActionHandlerContext } from "@ruiapp/rapid-core";
import type { MomRouteProcessParameterMeasurement } from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";
import { waitSeconds } from "~/utils/promise-utility";

// 移除测试专用参数，保留必要的批量控制参数
export type QueryInput = {
  batchSize?: number; // 批次大小，默认1
};

interface UploadDetail {
  measurementId: number;
  workOrderNo: string;
  status: "success" | "failed";
  message: string;
  timestamp: string;
  yidaResponse?: any; // 新增宜搭返回值字段
}

// 服务器操作定义 - 保持GET请求方式，用于手动触发
export default {
  code: "testUploadMeasurements", // 修改操作代码以区分
  method: "GET",
  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;
    const input: QueryInput = ctx.input;
    let totalUploaded = 0;
    const uploadDetails: UploadDetail[] = []; // 初始化上传详情数组

    logger.info("手动触发测量数据上传...");

    // 添加许可证验证（与定时任务保持一致）
    if (!tryValidateLicense(logger, server)) {
      throw new Error("无法上报检验记录到宜搭。");
    }

    const yidaSDK = await new YidaHelper(server).NewAPIClient();
    const yidaAPI = new YidaApi(logger, yidaSDK);

    // 循环查询直到没有数据（与定时任务逻辑一致）
    // while (true) {
    try {
      // 使用与定时任务完全相同的查询条件
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
          limit: input.batchSize || 1, // 默认批次大小1，可通过参数调整
        },
      });

      if (!measurements.length) {
        logger.info("没有更多待上传数据，任务结束");
        // break;
      }

      // 逐条处理数据（与定时任务逻辑一致）
      for (const measurement of measurements) {
        try {
          // 更新重试次数
          await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").updateEntityById({
            id: measurement.id,
            entityToSave: {
              retryTimes: (measurement.retryTimes || 0) + 1,
            },
          });

          // 调用宜搭API上传（捕获返回值）
          // 流程实例id
          const yidaResponse = await yidaAPI.uploadFAWProcessMeasurement(measurement);

          // 更新上报状态
          await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").updateEntityById({
            id: measurement.id,
            entityToSave: {
              isReported: true,
            },
          });

          totalUploaded++;
          // 记录成功详情，包含宜搭返回值
          uploadDetails.push({
            measurementId: measurement.id,
            workOrderNo: measurement.workOrder?.code || "未知工单",
            status: "success",
            message: "数据上传成功",
            timestamp: new Date().toISOString(),
            yidaResponse: yidaResponse,
          });
        } catch (error: any) {
          logger.error(`上传测量数据失败: ${error.message}`, { measurementId: measurement.id });
          // 记录失败详情，包含错误信息
          uploadDetails.push({
            measurementId: measurement.id,
            workOrderNo: measurement.workOrder?.code || "未知工单",
            status: "failed",
            message: error.message,
            timestamp: new Date().toISOString(),
            yidaResponse: error.response || null,
          });
        }
        await waitSeconds(5000); // 保持5秒间隔，避免接口限流
      }

      // 批次处理完成后等待10秒（与定时任务逻辑一致）
      await waitSeconds(1000 * 10);
    } catch (e: any) {
      logger.error(`上传过程出错: ${e.message}`);
      // 出错后继续处理下一批数据，而不是完全终止
      await waitSeconds(1000 * 10);
    }
    // }

    // 返回上传结果，包含详细信息
    ctx.output = {
      success: true,
      message: `手动上传完成，共处理${totalUploaded}条数据`,
      uploadedCount: totalUploaded,
      uploadDetails: uploadDetails, // 添加详细上传记录
    };
  },
} satisfies Record<string, any>;
