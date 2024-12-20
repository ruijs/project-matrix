import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";

export type ListInventoryOperationCountInput = {
  warehouseId?: number;
};

export type ListInventoryOperationCountOutput = {
  operationType: string;
  sourceType: string;
  waitingCount: number;
  completedCount: number;
};

export default {
  code: "listInventoryOperationCount",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const currentUserId = ctx.routerContext.state.userId;
    const input: ListInventoryOperationCountInput = ctx.input;
    const output = await listInventoryOperationCount(server, routeContext, input, currentUserId);

    ctx.output = output;
  },
} satisfies ServerOperation;

async function listInventoryOperationCount(server: IRpdServer, routeContext: RouteContext, input: ListInventoryOperationCountInput, currentUserId: number) {
  let stmt = `
    select mibt.operation_type,
           mibt.config ->> 'defaultSourceType'                as source_type,
           count(*) filter ( where mio.state = 'processing' ) as waiting_count,
           count(*) filter ( where mio.state = 'done' )       as completed_count
    from mom_inventory_operations mio
           inner join mom_inventory_business_types mibt on mio.business_id = mibt.id
    where 1 = 1
      and mio.operation_type = 'in'
    group by mibt.operation_type, mibt.config ->> 'defaultSourceType'
    union all
    select mibt.operation_type,
           mibt.config ->> 'defaultSourceType'                                                    as source_type,
           count(*)
           filter ( where mia.operation_state = 'processing' or mia.operation_state = 'pending' ) as waiting_count,
           count(*) filter ( where mia.operation_state = 'done' )                                 as completed_count
    from mom_inventory_applications mia
           inner join mom_inventory_business_types mibt on mia.business_id = mibt.id
    where 1 = 1
      and mia.operation_type = 'out'
    group by mibt.operation_type, mibt.config ->> 'defaultSourceType'
    union all
    select mibt.operation_type,
           mibt.config ->> 'defaultSourceType'                                                    as source_type,
           count(*)
           filter ( where mia.operation_state = 'processing' or mia.operation_state = 'pending' ) as waiting_count,
           count(*) filter ( where mia.operation_state = 'done' )                                 as completed_count
    from mom_inventory_applications mia
           inner join mom_inventory_business_types mibt on mia.business_id = mibt.id
    where 1 = 1
      and mia.operation_type = 'adjust'
    group by mibt.operation_type, mibt.config ->> 'defaultSourceType'
    union all
    select 'out'                                                                                  as operation_type,
           mibt.config ->> 'defaultSourceType'                                                    as source_type,
           count(*)
           filter ( where mia.operation_state = 'processing' or mia.operation_state = 'pending' ) as waiting_count,
           count(*) filter ( where mia.operation_state = 'done' )                                 as completed_count
    from mom_inventory_applications mia
           inner join mom_inventory_business_types mibt on mia.business_id = mibt.id
    where 1 = 1
      and mia.operation_type = 'transfer'
    group by mibt.operation_type, mibt.config ->> 'defaultSourceType'
  `;

  if (input.warehouseId && input.warehouseId > 0) {
    stmt = `
    select mibt.operation_type,
           mibt.config ->> 'defaultSourceType'                as source_type,
           count(*) filter ( where mio.state = 'processing' ) as waiting_count,
           count(*) filter ( where mio.state = 'done' )       as completed_count
    from mom_inventory_operations mio
           inner join mom_inventory_business_types mibt on mio.business_id = mibt.id
    where 1 = 1
      and mio.operation_type = 'in' and mio.warehouse_id = $1
    group by mibt.operation_type, mibt.config ->> 'defaultSourceType'
    union all
    select mibt.operation_type,
           mibt.config ->> 'defaultSourceType'                                                    as source_type,
           count(*)
           filter ( where mia.operation_state = 'processing' or mia.operation_state = 'pending' ) as waiting_count,
           count(*) filter ( where mia.operation_state = 'done' )                                 as completed_count
    from mom_inventory_applications mia
           inner join mom_inventory_business_types mibt on mia.business_id = mibt.id
    where 1 = 1
      and mia.operation_type = 'out' and (mia.from_warehouse_id = $1 or mia.to_warehouse_id = $1)
    group by mibt.operation_type, mibt.config ->> 'defaultSourceType'
    union all
    select mibt.operation_type,
           mibt.config ->> 'defaultSourceType'                                                    as source_type,
           count(*)
           filter ( where mia.operation_state = 'processing' or mia.operation_state = 'pending' ) as waiting_count,
           count(*) filter ( where mia.operation_state = 'done' )                                 as completed_count
    from mom_inventory_applications mia
           inner join mom_inventory_business_types mibt on mia.business_id = mibt.id
    where 1 = 1
      and mia.operation_type = 'adjust' and (mia.from_warehouse_id = $1 or mia.to_warehouse_id = $1)
    group by mibt.operation_type, mibt.config ->> 'defaultSourceType'
    union all
    select 'out'                                                                                  as operation_type,
           mibt.config ->> 'defaultSourceType'                                                    as source_type,
           count(*)
           filter ( where mia.operation_state = 'processing' or mia.operation_state = 'pending' ) as waiting_count,
           count(*) filter ( where mia.operation_state = 'done' )                                 as completed_count
    from mom_inventory_applications mia
           inner join mom_inventory_business_types mibt on mia.business_id = mibt.id
    where 1 = 1
      and mia.operation_type = 'transfer' and (mia.from_warehouse_id = $1 or mia.to_warehouse_id = $1)
    group by mibt.operation_type, mibt.config ->> 'defaultSourceType'
    `;
  }

  let params = [];
  if (input.warehouseId && input.warehouseId > 0) {
    params.push(input.warehouseId);
  }

  const transfers = await server.queryDatabaseObject(stmt, params, routeContext.getDbTransactionClient());

  const outputs = transfers.map((item) => {
    return {
      operationType: item.operation_type,
      sourceType: item.source_type,
      waitingCount: item.waiting_count,
      completedCount: item.completed_count,
    } as ListInventoryOperationCountOutput;
  });

  return outputs;
}
