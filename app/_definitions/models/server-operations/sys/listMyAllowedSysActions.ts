import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";

export default {
  code: "listMyAllowedSysActions",

  method: "GET",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const currentUserId = ctx.routerContext.state.userId;

    const actions = await server.queryDatabaseObject(
      `select distinct a.* from sys_actions a
      inner join oc_role_sys_action_links ra on a.id = ra.action_id
      inner join oc_role_user_links ru on ru.role_id = ra.role_id
      where ru.user_id = $1;`,
      [currentUserId],
      routeContext.getDbTransactionClient(),
    );

    ctx.output = actions.map((item) => item.code);
  },
} satisfies ServerOperation;
