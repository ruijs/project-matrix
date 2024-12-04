import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import type {
  MomMaterialInventoryBalance,
  MomRouteProcessParameterMeasurement,
  MomWorkReport
} from "~/_definitions/meta/entity-types";
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

        if (measurements) {
          let isOutSpecification = false
          let workReportId;
          for (const measurement of measurements) {
            if (measurement.isOutSpecification) {
              isOutSpecification = true
            }

            if (measurement?.workReport?.id) {
              workReportId = measurement.workReport.id
            }
          }

          if (isOutSpecification && workReportId) {
            await server.getEntityManager<MomWorkReport>("mom_work_report").updateEntityById({
              id: workReportId,
              entityToSave: {
                isOutSpecification: true,
              }
            })
          }
        }


      } catch (e) {
        console.log(e)
      }

    }
  },
] satisfies EntityWatcher<any>[];
