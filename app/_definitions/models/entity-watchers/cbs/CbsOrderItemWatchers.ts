import type { EntityWatchHandlerContext, EntityWatcher, IRpdServer, RouteContext } from "@ruiapp/rapid-core";

async function updateTotalAmountOfOrderByOrderItemId(server: IRpdServer, routeContext: RouteContext, orderItemId: any) {
  const sql = `
  with cte as (
      select order_id, sum(price * quantity) as total_amount
      from cbs_order_items
      where order_id in (select order_id from cbs_order_items where id=$1)
      group by order_id
      )
  update cbs_orders
  set total_amount = cte.total_amount
  from cte
  where id = cte.order_id;`;
  await server.queryDatabaseObject(sql, [orderItemId], routeContext.getDbTransactionClient());
}

async function updateTotalAmountOfOrderByOrderId(server: IRpdServer, routeContext: RouteContext, orderId: any) {
  const sql = `
  with cte as (
      select order_id, sum(price * quantity) as total_amount
      from cbs_order_items
      where order_id=$1
      group by order_id
      )
  update cbs_orders
  set total_amount = cte.total_amount
  from cte
  where id = cte.order_id;`;
  await server.queryDatabaseObject(sql, [orderId], routeContext.getDbTransactionClient());
}

export default [
  {
    eventName: "entity.create",
    modelSingularCode: "cbs_order_item",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const orderItem = payload.after;
      await updateTotalAmountOfOrderByOrderItemId(server, routeContext, orderItem.id);
    },
  },
  {
    eventName: "entity.update",
    modelSingularCode: "cbs_order_item",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const { changes } = payload;
      if (!changes.hasOwnProperty("price") && !changes.hasOwnProperty("quantity")) {
        return;
      }
      const orderItem = payload.after;
      await updateTotalAmountOfOrderByOrderItemId(server, routeContext, orderItem.id);
    },
  },
  {
    eventName: "entity.delete",
    modelSingularCode: "cbs_order_item",
    handler: async (ctx: EntityWatchHandlerContext<"entity.delete">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const orderItem = payload.before;
      await updateTotalAmountOfOrderByOrderId(server, routeContext, orderItem.order_id);
    },
  },
] satisfies EntityWatcher<any>[];
