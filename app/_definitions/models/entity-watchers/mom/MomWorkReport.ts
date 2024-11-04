import type {EntityWatcher, EntityWatchHandlerContext, IRpdServer} from "@ruiapp/rapid-core";
import type {
  BaseLot, MomPrintTemplate, MomRouteProcessParameter,
  MomRouteProcessParameterMeasurement,
  MomWorkReport,
  MomWorkTask,
  SaveBaseLotInput, SaveMomRouteProcessParameterMeasurementInput, SvcPrinter
} from "~/_definitions/meta/entity-types";
import dayjs from "dayjs";
import IotDBHelper, {ParseDeviceData} from "~/sdk/iotdb/helper";
import rapidApi from "~/rapidApi";
import {replaceTemplatePlaceholder} from "~/app-extension/rocks/print-trigger/PrintTrigger";
import {find} from "lodash";
import type PrinterService from "../../../../../rapid-plugins/printerService/PrinterService";
import {CreatePrintTasksInput} from "../../../../../rapid-plugins/printerService/PrinterPluginTypes";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "mom_work_report",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { server, payload } = ctx;
      let before = payload.before;

      if (!before.hasOwnProperty("actualStartTime")) {
        before.actualStartTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
      }
      if (!before.hasOwnProperty("actualFinishTime")) {
        before.executionState = "processing";
      }
      if (before.hasOwnProperty("actualFinishTime")) {
        before.executionState = "completed";
      }


      if (before.hasOwnProperty("workOrder")) {
        const workTask = await server.getEntityManager<MomWorkTask>("mom_work_task").findEntity({
          filters: [
            { operator: "eq", field: "process_id", value: before?.process?.id || before?.process || before.process_id },
            {
              operator: "eq",
              field: "equipment_id",
              value: before.equipment.id || before.equipment || before.equipment_id
            },
            {
              operator: "eq",
              field: "work_order_id",
              value: before.workOrder.id || before.workOrder || before.work_order_id
            },
            {
              operator: "eq",
              field: "executionState",
              value: "processing"
            },

          ],
          properties: ["id", "material", "process", "equipment", "workOrder", "factory"],
          relations: {
            process: {
              properties: [
                "id", "config"
              ],
            },
          }
        });

        if (workTask && workTask.process) {
          if (workTask?.process?.config?.reportLotNumAutoGenerate) {
            const lot = await saveMaterialLotInfo(server, {
              material: { id: workTask?.material?.id },
              sourceType: "selfMade",
              qualificationState: "qualified",
              isAOD: false,
              state: "normal",
            });
            if (lot) {
              before.lot = { id: lot.id };
              before.lotNum = lot.lotNum;
            }
          }
        }

        if (workTask) {
          before.work_task_id = workTask.id;
          before.factory = workTask.factory
        }
      }

      if (before.hasOwnProperty("lotNum") && !before.hasOwnProperty("lot")) {
        const lot = await server.getEntityManager("base_lot").findEntity({
          filters: [
            { operator: "eq", field: "lot_num", value: before.lotNum },
          ],
          properties: ["id", "material", "lotNum"],
        });
        if (lot) {
          before.lot = lot;
        }
      }
    }
  },
  {
    eventName: "entity.beforeUpdate",
    modelSingularCode: "mom_work_report",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeUpdate">) => {
      const { server, payload } = ctx;
      let changes = payload.changes;

      if (changes.hasOwnProperty("actualFinishTime")) {
        changes.executionState = 'completed';
      }
    }
  },
  {
    eventName: "entity.update",
    modelSingularCode: "mom_work_report",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, payload } = ctx;
      let after = payload.after;
      let changes = payload.changes;


      if (changes.hasOwnProperty("executionState") && changes.executionState === "completed") {
        const workReport = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntity({
          filters: [
            { operator: "eq", field: "id", value: after.id },
          ],
          properties: ["id", "factory", "process", "workOrder", "material", "equipment", "actualStartTime", "actualFinishTime", "executionState"],
        });

        if (!workReport) {
          return;
        }

        if (!workReport.equipment?.externalCode) {
          return;
        }


        try {
          const iotDBSDK = await new IotDBHelper(server).NewAPIClient();

          let input = {
            sql: `select last *
                  from root.devices.${ workReport.equipment?.externalCode }
                  where time >= ${ (dayjs(workReport.actualStartTime).unix() + 28800) * 1000 }
                    and time <= ${ (dayjs(workReport.actualFinishTime).unix() + 28800) * 1000 }`,
          }

          const tsResponse = await iotDBSDK.PostResourceRequest("http://10.0.0.3:6670/rest/v2/query", input, true)
          const data = ParseDeviceData(tsResponse.data);

          for (let deviceCode in data) {

            const deviceMetricData = data[deviceCode];
            for (let metricCode in deviceMetricData) {
              const metricData = deviceMetricData[metricCode];
              for (let i = 0; i < metricData.length; i++) {
                const item = metricData[i];
                const latestTimestamp = item.timestamp;
                const latestValue = item.value;
                // isOutSpecification
                const metricParameter = await server.getEntityManager<MomRouteProcessParameter>("mom_route_process_parameter").findEntity({
                  filters: [
                    {
                      operator: "exists",
                      field: "dimension",
                      filters: [{ operator: "eq", field: "code", value: metricCode }]
                    },
                    { operator: "eq", field: "process", value: workReport.process?.id },
                    { operator: "eq", field: "equipment", value: workReport.equipment?.id },
                  ],
                  properties: ["id", "upperLimit", "lowerLimit", "nominal", "dimension"],
                })


                if (!metricParameter) {
                  continue
                }

                if (!latestValue) {
                  continue
                }

                let isOutSpecification = false;
                if (latestValue < (metricParameter?.lowerLimit || 0) + (metricParameter.nominal || 0) || latestValue > (metricParameter?.upperLimit || 0) - (metricParameter.nominal || 0)) {
                  isOutSpecification = true
                }

                await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").createEntity({
                  entity: {
                    workOrder: workReport.workOrder?.id,
                    workReport: workReport.id,
                    process: workReport.process?.id,
                    equipment: workReport.equipment?.id,
                    factory: workReport.factory?.id,
                    value: latestValue,
                    dimension: metricParameter?.dimension?.id,
                    upperLimit: metricParameter?.upperLimit,
                    lowerLimit: metricParameter?.lowerLimit,
                    nominal: metricParameter?.nominal,
                    isOutSpecification: isOutSpecification,
                    createdAt: latestTimestamp,
                  } as SaveMomRouteProcessParameterMeasurementInput
                })
              }
            }
          }
        } catch (e) {
          console.log(e)
        }
      }
    }
  },
  {
    eventName: "entity.create",
    modelSingularCode: "mom_work_report",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, payload } = ctx;
      const after = payload.after;

      const workReport = await server.getEntityManager<MomWorkReport>("mom_work_report").findEntity({
        filters: [
          { operator: "eq", field: "id", value: after?.id },
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

      const workOrderEntityManager = server.getEntityManager("mom_work_order");
      await workOrderEntityManager.updateEntityById({
        id: workReport?.workOrder?.id,
        entityToSave: {
          executionState: 'processing',
        },
      });

      if (workReport && workReport.executionState === "completed") {

        if (!workReport.equipment?.externalCode) {
          return;
        }


        try {

          const iotDBSDK = await new IotDBHelper(server).NewAPIClient();

          let input = {
            sql: `select last *
                  from root.devices.${ workReport.equipment?.externalCode }
                  where time >= ${ (dayjs(workReport.actualStartTime).unix() + 28800) * 1000 }
                    and time <= ${ (dayjs(workReport.actualFinishTime).unix() + 28800) * 1000 }`,
          }

          const tsResponse = await iotDBSDK.PostResourceRequest("http://10.0.0.3:6670/rest/v2/query", input, true)
          const data = ParseDeviceData(tsResponse.data);

          for (let deviceCode in data) {
            const deviceMetricData = data[deviceCode];
            // append work duration to device metric

            if (workReport.equipment.externalCode === deviceCode && workReport?.duration) {
              deviceMetricData["work_duration"] = [{
                timestamp: dayjs().unix(),
                value: workReport.duration / 1000,
              }]
            }


            for (let metricCode in deviceMetricData) {
              const metricData = deviceMetricData[metricCode];
              for (let i = 0; i < metricData.length; i++) {
                const item = metricData[i];
                const latestTimestamp = item.timestamp;
                const latestValue = item.value;
                // isOutSpecification
                const metricParameter = await server.getEntityManager<MomRouteProcessParameter>("mom_route_process_parameter").findEntity({
                  filters: [
                    {
                      operator: "exists",
                      field: "dimension",
                      filters: [{ operator: "eq", field: "code", value: metricCode }]
                    },
                    { operator: "eq", field: "process", value: workReport.process?.id },
                    { operator: "eq", field: "equipment", value: workReport.equipment?.id },
                  ],
                  properties: ["id", "upperLimit", "lowerLimit", "nominal", "dimension"],
                })


                if (!metricParameter) {
                  continue
                }

                if (!latestValue) {
                  continue
                }

                let isOutSpecification = false;
                if (latestValue < (metricParameter?.lowerLimit || 0) + (metricParameter.nominal || 0) || latestValue > (metricParameter?.upperLimit || 0) - (metricParameter.nominal || 0)) {
                  isOutSpecification = true
                }

                await server.getEntityManager<MomRouteProcessParameterMeasurement>("mom_route_process_parameter_measurement").createEntity({
                  entity: {
                    workOrder: workReport.workOrder?.id,
                    workReport: workReport.id,
                    process: workReport.process?.id,
                    equipment: workReport.equipment?.id,
                    factory: workReport.factory?.id,
                    value: latestValue,
                    dimension: metricParameter?.dimension?.id,
                    upperLimit: metricParameter?.upperLimit,
                    lowerLimit: metricParameter?.lowerLimit,
                    nominal: metricParameter?.nominal,
                    isOutSpecification: isOutSpecification,
                    createdAt: latestTimestamp,
                  } as SaveMomRouteProcessParameterMeasurementInput
                })
              }
            }
          }
        } catch (e) {
          console.log(e)
        }
      }

      if (workReport && workReport.executionState === "completed" && workReport?.process?.config?.printTemplateCode && workReport?.process?.config?.printerCode) {

        const printTemplate = await server.getEntityManager<MomPrintTemplate>("mom_print_template").findEntity({
          filters: [
            { operator: "eq", field: "code", value: workReport?.process?.config?.printTemplateCode },
          ],
          properties: ["id", "content"],
        })

        let dataSource = [
          {
            taskData: {
              materialCode: workReport?.workOrder?.material?.code,
              materialName: workReport?.workOrder?.material?.name,
              processCode: workReport?.process?.code,
              processName: workReport?.process?.name,
              lotNum: workReport?.lotNum,
              serialNum: workReport?.serialNum,
              workOrderCode: workReport?.workOrder?.code,
              printTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
              KT: workReport.workOrder?.material?.name === "B9" ? "KT" : ""
            },
          }
        ]

        if (printTemplate && printTemplate?.content) {
          const printer = await server.getEntityManager<SvcPrinter>("svc_printer").findEntity({
            filters: [
              { operator: "eq", field: "code", value: workReport?.process?.config?.printerCode },
            ],
            properties: ["id", "networkState"],
          })


          //   TODO: 注塑工序自动打印
          if (printer && printer.networkState === "1") {
            console.log(`print work report: Template ${ workReport?.process?.config?.printTemplateCode } -- Printer ${ workReport?.process?.config?.printerCode }`)

            const printerService = server.getService<PrinterService>("printerService");
            await printerService.createPrintTasks({
              code: workReport?.process?.config?.printerCode,
              tasks: (dataSource || [])
                .map((record: any) => {
                  return {
                    type: "zpl-label",
                    name: "标签打印",
                    data: replaceTemplatePlaceholder(printTemplate.content!, record?.taskData),
                  };
                })
                .filter((item) => !!item.data)
            } as CreatePrintTasksInput)
          }

        }
      }

    }
  },
] satisfies EntityWatcher<any>[];


async function saveMaterialLotInfo(server: IRpdServer, lot: SaveBaseLotInput) {
  if (!lot.material || !lot.material.id) {
    throw new Error("material are required when saving lot info.");
  }

  const baseLotManager = server.getEntityManager<BaseLot>("base_lot");
  return await baseLotManager.createEntity({ entity: lot })
}
