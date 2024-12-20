import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type { BaseMaterial, MomGood } from "~/_definitions/meta/entity-types";

export type QueryGoodOutTransferInput = {
  operationId: number;
};

export type QueryGoodOutTransferOutput = {
  operationId: number;
  material: Partial<BaseMaterial>;
  totalAmount?: number;
  totalShelves?: number;
  diffAmount?: number;
  checkedAmount?: number;
  checkedShelves?: number;
  lossGoods?: MomGood[];
  profitGoods?: MomGood[];
};

export default {
  code: "listInventoryCheckTransfers",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: QueryGoodOutTransferInput = ctx.input;

    ctx.output = await listGoodCheckTransfers(server, routeContext, input);
  },
} satisfies ServerOperation;

async function listGoodCheckTransfers(server: IRpdServer, routeContext: RouteContext, input: QueryGoodOutTransferInput) {
  const transfers = await server.queryDatabaseObject(
    `
      WITH inventory_checked_cte AS (SELECT mio.id                                                       AS operation_id,
                                            miai.material_id,
                                            COALESCE(COUNT(mg.id) FILTER ( WHERE mg.id NOTNULL ), 0)     AS total_shelves,
                                            SUM(COALESCE(mg.quantity, 0))                                AS total_amount,
                                            SUM(COALESCE(micr.quantity, 0))                              AS checked_amount,
                                            COALESCE(COUNT(micr.id) FILTER ( WHERE micr.id NOTNULL ), 0) AS checked_shelves,
                                            COALESCE(ARRAY_AGG(micr.good_id) FILTER ( WHERE micr.id NOTNULL ),
                                                     '{}'::int[])                                        AS checked_good_ids,
                                            COALESCE(ARRAY_AGG(mg.id) FILTER ( WHERE mg.id NOTNULL ),
                                                     '{}'::int[])                                        AS in_stock_good_ids
                                     FROM mom_inventory_operations mio
                                            INNER JOIN mom_inventory_application_items miai
                                                       ON mio.application_id = miai.operation_id
                                            LEFT JOIN mom_goods mg
                                                      ON miai.material_id = mg.material_id AND
                                                         mg.state = 'normal' AND
                                                         mg.location_id NOTNULL
                                            LEFT JOIN mom_inventory_check_records micr
                                                      ON miai.material_id = micr.material_id AND
                                                         mio.id = micr.operation_id AND
                                                         micr.operation_id = $1
                                     WHERE 1 = 1
                                       AND mio.id = $1
                                     GROUP BY mio.id, miai.material_id),
           profit_loss_good_ids_cte AS (SELECT *,
                                               ARRAY(
                                                 SELECT unnest(checked_good_ids)
                                                 except
                                                 select unnest(in_stock_good_ids)
                                               ) AS profit_good_ids,
                                               ARRAY(
                                                 SELECT unnest(in_stock_good_ids)
                                                 except
                                                 select unnest(checked_good_ids)
                                               ) AS loss_good_ids
                                        FROM inventory_checked_cte),
           profit_loss_goods_cte AS (SELECT plgic.operation_id,
                                            plgic.material_id,
                                            COALESCE(JSONB_AGG(jsonb_build_object(
                                              'id',
                                              mg_profit.id,
                                              'lotId',
                                              mg_profit.lot_id,
                                              'lotNum',
                                              mg_profit.lot_num,
                                              'binNum',
                                              mg_profit.bin_num,
                                              'manufactureDate',
                                              mg_profit.manufacture_date,
                                              'validityDate',
                                              mg_profit.validity_date,
                                              'quantity',
                                              mg_profit.quantity))
                                                     FILTER ( WHERE mg_profit.id NOTNULL ),
                                                     '[]'::jsonb) AS profit_goods,
                                            COALESCE(JSONB_AGG(jsonb_build_object(
                                              'id',
                                              mg_loss.id,
                                              'lotId',
                                              mg_profit.lot_id,
                                              'lotNum',
                                              mg_loss.lot_num,
                                              'binNum',
                                              mg_loss.bin_num,
                                              'manufactureDate',
                                              mg_loss.manufacture_date,
                                              'validityDate',
                                              mg_loss.validity_date,
                                              'quantity',
                                              mg_loss.quantity))
                                                     FILTER ( WHERE mg_loss.id NOTNULL ),
                                                     '[]'::jsonb) AS loss_goods
                                     FROM profit_loss_good_ids_cte plgic
                                            LEFT JOIN mom_goods mg_profit
                                                      ON plgic.profit_good_ids @> ARRAY [mg_profit.id]::int[]
                                            LEFT JOIN mom_goods mg_loss ON
                                       plgic.loss_good_ids @> ARRAY [mg_loss.id]::int[]
                                     GROUP BY plgic.operation_id, plgic.material_id)
      SELECT icc.*,
             plgc.profit_goods,
             plgc.loss_goods,
             icc.checked_amount - icc.total_amount AS diff_amount,
             jsonb_build_object('id', bm.id,
                                'code', bm.code,
                                'name', bm.name,
                                'specification', bm.specification,
                                'qualityGuaranteePeriod', bm.quality_guarantee_period,
                                'defaultUnit',
                                to_jsonb(bu.*)) AS material
      FROM inventory_checked_cte icc
             INNER JOIN base_materials bm
                        ON icc.material_id = bm.id
             INNER JOIN base_units bu ON bm.default_unit_id = bu.id
             LEFT JOIN profit_loss_goods_cte plgc
                       ON icc.operation_id = plgc.operation_id AND icc.material_id = plgc.material_id;
    `,
    [input.operationId],
    routeContext.getDbTransactionClient(),
  );

  return transfers.map((item) => {
    return {
      operationId: item.operation_id,
      material: item.material,
      totalAmount: item.total_amount,
      totalShelves: item.total_shelves,
      diffAmount: item.diff_amount,
      checkedAmount: item.checked_amount,
      checkedShelves: item.checked_shelves,
      lossGoods: item.loss_goods,
      profitGoods: item.profit_goods,
    } as QueryGoodOutTransferOutput;
  });
}
