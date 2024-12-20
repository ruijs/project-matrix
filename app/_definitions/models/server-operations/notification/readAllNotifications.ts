import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";

export default {
  code: "readAllNotifications",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const currentUserId = ctx.routerContext.state.userId;

    if (!currentUserId) {
      throw new Error("您的登录已失效。");
    }

    await server.queryDatabaseObject(
      `update notifications set read = true where read = false and user_id = $1;`,
      [currentUserId],
      routeContext.getDbTransactionClient(),
    );
    ctx.output = {};
  },
} satisfies ServerOperation;
