import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type { BaseMaterial } from "~/_definitions/meta/entity-types";

export type QueryGoodOutTransferInput = {
  operationId: number;
};

export type QueryGoodOutTransferOutput = {
  operationId: number;
  material: Partial<BaseMaterial>;
  totalAmount?: number;
  totalShelves?: number;
  waitingAmount?: number;
  waitingShelves?: number;
  checkedAmount?: number;
  checkedShelves?: number;
};

export default {
  code: "listGoodCheckTransfers",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: QueryGoodOutTransferInput = ctx.input;

    const transferOutputs = await listGoodCheckTransfers(server, routeContext, input);

    ctx.output = transferOutputs;
  },
} satisfies ServerOperation;

async function listGoodCheckTransfers(server: IRpdServer, routeContext: RouteContext, input: QueryGoodOutTransferInput) {
  const transfers = await server.queryDatabaseObject(
    `
WITH goods_in_stock_cte AS (SELECT mio.id                                                   AS operation_id,
                                   miai.material_id,
                                   COALESCE(COUNT(mg.id) FILTER ( WHERE mg.id NOTNULL ), 0) AS total_shelves,
                                   SUM(COALESCE(mg.quantity, 0))                            AS total_amount,
                                   COALESCE(ARRAY_AGG(mg.id) FILTER ( WHERE mg.id NOTNULL ),
                                            '{}'::int[])                                    AS in_stock_good_ids
                            FROM mom_inventory_operations mio
                                     INNER JOIN mom_inventory_application_items miai
                                                ON mio.application_id = miai.operation_id
                                     LEFT JOIN mom_goods mg
                                               ON miai.material_id = mg.material_id
                            WHERE mio.id = $1
                              AND mg.state = 'normal'
                              AND mg.location_id NOTNULL
                            GROUP BY mio.id, miai.material_id),
     goods_checked_cte AS (SELECT mio.id                                                       AS operation_id,
                                  miai.material_id,
                                  SUM(COALESCE(micr.quantity, 0))                              AS checked_amount,
                                  COALESCE(COUNT(micr.id) FILTER ( WHERE micr.id NOTNULL ), 0) AS checked_shelves,
                                  COALESCE(ARRAY_AGG(micr.good_id) FILTER ( WHERE micr.id NOTNULL ),
                                           '{}'::int[])                                        AS checked_good_ids
                           FROM mom_inventory_operations mio
                                    INNER JOIN mom_inventory_application_items miai
                                               ON mio.application_id = miai.operation_id
                                    LEFT JOIN mom_inventory_check_records micr
                                              ON miai.material_id = micr.material_id
                           WHERE mio.id = $1
                             AND mio.id = micr.operation_id
                             AND micr.operation_id = $1
                           GROUP BY mio.id, miai.material_id),
     inventory_checked_cte AS (SELECT goods_in_stock_cte.operation_id,
                                      goods_in_stock_cte.material_id,
                                      goods_in_stock_cte.total_shelves,
                                      goods_in_stock_cte.total_amount,
                                      goods_in_stock_cte.in_stock_good_ids,
                                      COALESCE(goods_checked_cte.checked_amount, 0) AS checked_amount,
                                      COALESCE(goods_checked_cte.checked_shelves, 0) AS checked_shelves,
                                      goods_checked_cte.checked_good_ids
                               FROM goods_in_stock_cte
                                        LEFT JOIN goods_checked_cte
                                                   ON goods_in_stock_cte.material_id = goods_checked_cte.material_id),
     result AS (SELECT ioc.*,
                       greatest(ioc.total_amount - ioc.checked_amount,
                                0)                        AS waiting_amount,
                       greatest(ioc.total_shelves - ioc.checked_shelves,
                                0)                        AS waiting_shelves,
                       jsonb_build_object('id', bm.id,
                                          'code', bm.code,
                                          'name', bm.name,
                                          'specification', bm.specification,
                                          'qualityGuaranteePeriod', bm.quality_guarantee_period,
                                          'defaultUnit',
                                          to_jsonb(bu.*)) AS material
                FROM inventory_checked_cte ioc
                         INNER JOIN base_materials bm ON ioc.material_id = bm.id
                         INNER JOIN base_units bu ON bm.default_unit_id = bu.id)
SELECT r.*
FROM result r;
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
      waitingAmount: item.waiting_amount,
      waitingShelves: item.waiting_shelves,
      checkedAmount: item.checked_amount,
      checkedShelves: item.checked_shelves,
    } as QueryGoodOutTransferOutput;
  });
}
