import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";
import {MomInspectionSheet, MomTransportOperation, MomTransportOperationItem} from "~/_definitions/meta/entity-types";
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
            properties: ["id", "operation", "material", "lotNum", "quantity", "unit", "sealNum", "remark", "deliveryOrderFile", "qualityInspectionReportFile", "sealNumPicture"],
          });

          if (transportItems) {
            const yidaSDK = await new YidaHelper(server).NewAPIClient();
            const yidaAPI = new YidaApi(yidaSDK);

            const yidaResp = await yidaAPI.uploadTransmitAudit(transportItems)

            if (yidaResp && yidaResp.result) {
              await server.getEntityManager<MomTransportOperation>("mom_transport_operation").updateEntityById({
                routeContext: ctx.routerContext,
                id: after.id,
                entityToSave: {
                  yidaId: yidaResp.result
                }
              });
            }
          }
        }

      } catch (e) {
        console.log(e)
      }

    }
  },
] satisfies EntityWatcher<any>[];


function main(ctx){
// 机器信息
// ctx.Machine
// 当前字段数据
// ctx.RuntimeFields
// 当前上报属性数据
// ctx.AttributeData
  resp = ctx.DoRequest({
    method: "POST",
    url: "http://192.168.1.60:3005/api/app/iotCallback",
    timeout: 10,
    responseType: "json",
    data: {
      machine: ctx.Machine,
      runtimeFields: ctx.RuntimeFields,
      attributeData: ctx.AttributeData
    }
  });

  console.log(resp.status);
  console.log(resp.headers);
  console.log(resp.data);
}
