import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";
import { MomInspectionSheet, MomTransportOperation } from "~/_definitions/meta/entity-types";
import YidaHelper from "~/sdk/yida/helper";
import YidaApi from "~/sdk/yida/api";

export type CallbackInput = {
  code: string;
  sign: string;
  kind: string;
  id: string;
};

export default {
  code: "dingtalkCallback",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const logger = server.getLogger();
    const input: CallbackInput = ctx.input;

    try {
      const yidaSDK = await new YidaHelper(server).NewAPIClient();
      const yidaAPI = new YidaApi(logger, yidaSDK);

      switch (input.kind) {
        case "transport":
          const transportOperation = await server.getEntityManager<MomTransportOperation>("mom_transport_operation").findEntity({
            filters: [
              {
                operator: "eq",
                field: "code",
                value: input.id,
              },
            ],
            properties: ["id", "material", "code", "yidaId", "createdBy"],
          });

          if (transportOperation && transportOperation.yidaId) {
            const dingtalkUserId = transportOperation?.createdBy?.dingtalkUserId || "036025480920111923";
            const yidaResp = await yidaAPI.getAuditDetail(transportOperation.yidaId, dingtalkUserId, input.kind);

            await server.getEntityManager<MomTransportOperation>("mom_transport_operation").updateEntityById({
              routeContext: ctx.routerContext,
              id: transportOperation.id,
              entityToSave: {
                approvalState: yidaResp?.approvedResult === "agree" ? "approved" : "rejected",
              },
            });
          }

          break;
        case "inspect":
          const inspectSheet = await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").findEntity({
            filters: [
              {
                operator: "eq",
                field: "code",
                value: input.id,
              },
            ],
            properties: ["id", "material", "code", "yidaId", "createdBy"],
          });

          if (inspectSheet && inspectSheet.yidaId) {
            const dingtalkUserId = inspectSheet?.createdBy?.dingtalkUserId || "036025480920111923";
            const yidaResp = await yidaAPI.getAuditDetail(inspectSheet.yidaId, dingtalkUserId, input.kind);

            await server.getEntityManager<MomInspectionSheet>("mom_inspection_sheet").updateEntityById({
              routeContext: ctx.routerContext,
              id: inspectSheet.id,
              entityToSave: {
                approvalState: yidaResp?.approvedResult === "agree" ? "approved" : "rejected",
              },
            });
          }

          break;
        case "metric":
          console.log(input);
          break;
      }
    } catch (e) {
      console.log(e);
    }

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;
