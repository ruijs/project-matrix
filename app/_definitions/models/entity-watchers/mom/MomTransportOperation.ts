import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { MomInspectionSheet, MomTransportOperation, MomTransportOperationItem } from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export default [
  {
    eventName: "entity.update",
    modelSingularCode: "mom_transport_operation",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, payload } = ctx;
      const after = payload.after;
      const changes = payload.changes;

      try {
        if (changes.hasOwnProperty("state") && changes.state === "finished") {
          const transportItems = await server.getEntityManager<MomTransportOperationItem>("mom_transport_operation_item").findEntities({
            filters: [{ operator: "eq", field: "operation_id", value: after.id }],
            properties: ["id", "operation", "material", "binNum", "manufacturer", "lotNum", "quantity", "unit", "sealNum", "remark", "deliveryOrderFile", "qualityInspectionReportFile", "sealNumPicture", "sealNumMatch", "binNumMatch", "manufacturerMatch"],
            relations: {
              operation: {
                properties: ["id", "code", "orderNumb", "supplier", "createdBy"]
              }
            }
          });

          if (transportItems) {
            const yidaSDK = await new YidaHelper(server).NewAPIClient();
            const yidaAPI = new YidaApi(yidaSDK);

            const yidaResp = await yidaAPI.uploadTransmitAudit(transportItems);
            await yidaAPI.uploadFAWTYSTransportMeasurement(transportItems)

            if (yidaResp && yidaResp.result) {
              await server.getEntityManager<MomTransportOperation>("mom_transport_operation").updateEntityById({
                routeContext: ctx.routerContext,
                id: after.id,
                entityToSave: {
                  yidaId: yidaResp.result,
                },
              });
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
] satisfies EntityWatcher<any>[];
