import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type { BaseLot, BaseMaterial } from "~/_definitions/meta/entity-types";

export type QueryGoodInTransferInput = {
  operationId: number;
};

export type QueryGoodInTransferOutput = {
  operationId: number;
  material: Partial<BaseMaterial>;
  lotNum: string;
  shelveAmount: number;
  waitingAmount: number;
  waitingPalletAmount: number;
  completedAmount: number;
  completedPalletAmount: number;
  inspectState?: string;
  lot?: Partial<BaseLot>;
  shelves: {
    binNum: string;
    quantity: number;
    toLocationId: number;
  }[];
};

export default {
  code: "listGoodInTransfers",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: QueryGoodInTransferInput = ctx.input;

    const transferOutputs = await listGoodInTransfers(server, routeContext, input);

    ctx.output = transferOutputs;
  },
} satisfies ServerOperation;

async function listGoodInTransfers(server: IRpdServer, routeContext: RouteContext, input: QueryGoodInTransferInput) {
  const transfers = await server.queryDatabaseObject(
    `
      with result AS (select operation_id,
                             material_id,
                             lot_num,
                             lot_id,
                             count(*)                                                               as shelve_amount,
                             coalesce(sum(quantity) filter ( where to_location_id is null ), 0)     as waiting_amount,
                             count(*) filter ( where to_location_id is null )                       as waiting_pallet_amount,
                             coalesce(sum(quantity) filter ( where to_location_id is not null ), 0) as completed_amount,
                             count(*) filter ( where to_location_id is not null )                   as completed_pallet_amount,
                             jsonb_agg(jsonb_build_object('binNum', bin_num, 'quantity', quantity, 'toLocationId',
                                                          to_location_id))                             shelves
                      from mom_good_transfers mdt
                      where lot_num notnull
                        and lot_num <> ''
                        and bin_num notnull
                        and bin_num <> ''
                        and operation_id = $1
                      group by operation_id, material_id, lot_num, lot_id)
      select r.*,
             jsonb_build_object('id', bl.id, 'state', bl.state, 'lotNum', bl.lot_num, 'sourceType', bl.source_type,
                                'manufactureDate', bl.manufacture_date, 'expireTime', bl.expire_time,
                                'qualificationState', bl.qualification_state) AS lot,
             case
               when bm.is_inspection_free then 'inspectFree'
               else coalesce(mis.result, 'uninspected') end                   as inspect_state,
             jsonb_build_object('id', bm.id, 'code', bm.code, 'name', bm.name, 'specification', bm.specification,
                                'qualityGuaranteePeriod', bm.quality_guarantee_period,
                                'defaultUnit', to_jsonb(bu.*))                AS material
      from result r
             inner join base_materials bm on r.material_id = bm.id
             inner join base_units bu on bm.default_unit_id = bu.id
             left join base_lots bl on r.lot_id = bl.id
             left join mom_inspection_sheets mis on r.material_id = mis.material_id and r.lot_num = mis.lot_num and r.operation_id = mis.inventory_operation_id
      order by r.waiting_pallet_amount asc;
    `,
    [input.operationId],
    routeContext.getDbTransactionClient(),
  );

  const transferOutputs = transfers.map((item) => {
    return {
      operationId: item.operation_id,
      material: item.material,
      lotNum: item.lot_num,
      shelveAmount: item.shelve_amount,
      completedAmount: item.completed_amount,
      completedPalletAmount: item.completed_pallet_amount,
      waitingAmount: item.waiting_amount,
      waitingPalletAmount: item.waiting_pallet_amount,
      shelves: item.shelves,
      lot: item.lot,
      inspectState: item.inspect_state,
    } as QueryGoodInTransferOutput;
  });

  return transferOutputs;
}
