import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import { find } from "lodash";
import type { BaseLot, BaseMaterial } from "~/_definitions/meta/entity-types";

export type QueryGoodOutTransferInput = {
  operationId: number;
  modify: boolean;
};

export type QueryGoodOutTransferOutput = {
  operationId: number;
  material: Partial<BaseMaterial>;
  lotNum: string;
  totalAmount?: number;
  waitingAmount?: number;
  completedAmount?: number;
  lot?: Partial<BaseLot>;
  goods: {
    id: number;
    binNum: string;
    quantity: number;
    cumulativeQuantity: number;
    location: {
      id: number;
      code: string;
      name: string;
    };
  }[];
};

export default {
  code: "listGoodOutTransfers",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: QueryGoodOutTransferInput = ctx.input;

    const transferOutputs = await listGoodOutTransfers(server, routeContext, input);

    ctx.output = transferOutputs;
  },
} satisfies ServerOperation;

async function listGoodOutTransfers(server: IRpdServer, routeContext: RouteContext, input: QueryGoodOutTransferInput) {
  const operationId = input.operationId;
  let sql: string;
  sql = `
SELECT mio.id,
       mio.application_id
FROM mom_inventory_operations mio
WHERE mio.id=$1;
  `;
  const inventoryOperations = await server.queryDatabaseObject(sql, [operationId], routeContext.getDbTransactionClient());
  const inventoryOperation = inventoryOperations[0];
  if (!inventoryOperation) {
    throw new Error(`未找到id为${operationId}的库存操作单。`);
  }

  // 查询应出库物料清单
  sql = `
SELECT miai.id,
       miai.material_id,
       miai.lot_num,
       miai.bin_num,
       miai.quantity AS total_amount,
       jsonb_build_object('id', bm.id,
                          'code', bm.code,
                          'name', bm.name,
                          'specification', bm.specification,
                          'qualityGuaranteePeriod', bm.quality_guarantee_period,
                          'defaultUnit',
                          to_jsonb(bu.*)) AS material
FROM mom_inventory_application_items miai
         INNER JOIN base_materials bm ON miai.material_id = bm.id
         INNER JOIN base_units bu ON bm.default_unit_id = bu.id
WHERE miai.operation_id = $1
ORDER BY bm.code, miai.lot_num NULLS LAST, miai.bin_num NULLS LAST;
  `;
  const itemsShouldOperate = await server.queryDatabaseObject(sql, [inventoryOperation.application_id], routeContext.getDbTransactionClient());

  // 查询已出库物料清单
  sql = `
SELECT mgt.id,
       mgt.material_id,
       mgt.lot_num,
       mgt.bin_num,
       mgt.quantity
FROM mom_good_transfers mgt
WHERE operation_id = $1;
  `;
  const itemsTransfered = await server.queryDatabaseObject(sql, [operationId], routeContext.getDbTransactionClient());

  // 统计已出库数量
  for (const item of itemsShouldOperate) {
    item.completed_amount = 0;
    item.transfers = [];
    item.goods = [];
  }

  for (const itemTransfered of itemsTransfered) {
    if (itemTransfered.lot_num && itemTransfered.bin_num) {
      const itemToOperate = find(itemsShouldOperate, (item) => {
        return item.material_id === itemTransfered.material_id && item.lot_num === itemTransfered.lot_num && item.bin_num === itemTransfered.bin_num;
      });

      if (itemToOperate) {
        itemToOperate.transfers.push(itemTransfered);
        itemToOperate.completed_amount += itemTransfered.quantity;
        itemToOperate.binded = true;
      }
    }
  }

  for (const itemTransfered of itemsTransfered) {
    if (itemTransfered.binded) {
      continue;
    }

    if (itemTransfered.lot_num) {
      const itemToOperate = find(itemsShouldOperate, (item) => {
        return item.material_id === itemTransfered.material_id && item.lot_num === itemTransfered.lot_num && !item.bin_num;
      });
      if (itemToOperate) {
        itemToOperate.transfers.push(itemTransfered);
        itemToOperate.completed_amount += itemTransfered.quantity;
        itemToOperate.binded = true;
      }
    }
  }

  for (const itemTransfered of itemsTransfered) {
    if (itemTransfered.binded) {
      continue;
    }

    const itemToOperate = find(itemsShouldOperate, (item) => {
      return item.material_id === itemTransfered.material_id && !item.lot_num && !item.bin_num;
    });
    if (itemToOperate) {
      itemToOperate.transfers.push(itemTransfered);
      itemToOperate.completed_amount += itemTransfered.quantity;
      itemToOperate.binded = true;
    }
  }

  // 统计待出库物料数量，并查询待出库物料所在库位信息
  for (const item of itemsShouldOperate) {
    item.waiting_amount = Math.max(item.total_amount - item.completed_amount, 0);

    if (item.waiting_amount === 0) {
      continue;
    }

    if (item.lot_num && item.bin_num) {
      sql = `
SELECT mg.quantity,
       jsonb_build_object('id', bl.id, 'name', bl.name, 'code', bl.code) AS location
FROM mom_goods mg
    INNER JOIN base_locations bl ON mg.location_id = bl.id
WHERE mg.material_id = $1
  AND mg.lot_num = $2
  AND mg.bin_num = $3
  AND mg.state = 'normal';
            `;
      item.goods = await server.queryDatabaseObject(sql, [item.material_id, item.lot_num, item.bin_num], routeContext.getDbTransactionClient());
    } else {
      sql = `
WITH good_quantity_cte AS (SELECT mg.location_id,
                                  sum(mg.quantity) AS quantity
                           FROM mom_goods mg
                           WHERE mg.material_id = $1
                             AND mg.lot_num = $2
                             AND mg.state = 'normal'
                           GROUP BY mg.location_id)
SELECT gqc.quantity,
       jsonb_build_object('id', bl.id, 'name', bl.name, 'code', bl.code) AS location
FROM base_locations bl
         INNER JOIN good_quantity_cte gqc ON bl.id = gqc.location_id
ORDER BY bl.code;
            `;
      item.goods = await server.queryDatabaseObject(sql, [item.material_id, item.lot_num], routeContext.getDbTransactionClient());
    }
  }

  return itemsShouldOperate.map((item) => {
    return {
      id: item.id,
      operationId,
      material: item.material,
      lotNum: item.lot_num,
      binNum: item.bin_num,
      totalAmount: item.total_amount,
      completedAmount: item.completed_amount,
      waitingAmount: item.waiting_amount,
      lot: item.lot,
      goods: item.goods,
      transfers: item.transfers,
    };
  });
}

async function listGoodOutTransfersLegacy(server: IRpdServer, routeContext: RouteContext, input: QueryGoodOutTransferInput) {
  let stmt = `
WITH inventory_good_transfers_cte AS (SELECT operation_id,
                                             material_id,
                                             lot_num,
                                             lot_id,
                                             SUM(quantity) AS completed_amount
                                      FROM mom_good_transfers
                                      WHERE operation_id = $1
                                      GROUP BY operation_id,
                                               material_id,
                                               lot_num,
                                               lot_id),
     inventory_operation_amount_cte AS (SELECT mio.id           AS operation_id,
                                               miai.material_id,
                                               miai.lot_num,
                                               sum(coalesce(miai.quantity,
                                                            0)) AS total_amount
                                        FROM mom_inventory_operations mio
                                                 INNER JOIN mom_inventory_application_items miai
                                                            ON mio.application_id = miai.operation_id
                                        WHERE mio.id = $1
                                        GROUP BY mio.id,
                                                 miai.material_id,
                                                 miai.lot_num),
     inventory_operation_cte AS (SELECT mio.operation_id,
                                        mio.material_id,
                                        mio.lot_num,
                                        mio.total_amount,
                                        coalesce(mgt.completed_amount, 0) AS completed_amount
                                 FROM inventory_operation_amount_cte mio
                                          LEFT JOIN inventory_good_transfers_cte mgt
                                                    ON mio.operation_id = mgt.operation_id
                                                        AND mio.material_id = mgt.material_id
                                                        AND mio.lot_num = mgt.lot_num
                                 WHERE mio.operation_id = $1),
     inventory_operation_goods_cte AS (SELECT ioc.operation_id,
                                              mg.material_id,
                                              mg.lot_id,
                                              mg.lot_num,
                                              mg.location_id,
                                              SUM(mg.quantity) AS quantity
                                       FROM mom_goods mg
                                                INNER JOIN inventory_operation_cte ioc
                                                           ON mg.material_id = ioc.material_id
                                                               AND mg.lot_num = ioc.lot_num
                                       WHERE mg.state = 'normal'
                                       GROUP BY ioc.operation_id, mg.material_id, mg.lot_id, mg.lot_num,
                                                mg.location_id),
     inventory_operation_goods_agg_cte AS (SELECT iogc.operation_id,
                                                  iogc.material_id,
                                                  iogc.lot_num,
                                                  iogc.lot_id,
                                                  jsonb_agg(jsonb_build_object('lotNum',
                                                                               iogc.lot_num,
                                                                               'quantity',
                                                                               iogc.quantity,
                                                                               'location',
                                                                               to_jsonb(bl.*))) AS goods
                                           FROM inventory_operation_goods_cte iogc
                                                    INNER JOIN base_locations bl ON iogc.location_id = bl.id
                                           GROUP BY iogc.operation_id,
                                                    iogc.material_id,
                                                    iogc.lot_num,
                                                    iogc.lot_id),
     result AS (SELECT ioc.*,
                       jsonb_build_object('id', bl.id, 'state', bl.state, 'lotNum', bl.lot_num, 'sourceType',
                                          bl.source_type, 'manufactureDate', bl.manufacture_date, 'expireTime',
                                          bl.expire_time, 'qualificationState', bl.qualification_state) AS lot,
                       greatest(ioc.total_amount - ioc.completed_amount,
                                0)                                                                      AS waiting_amount,
                       iogc.goods,
                       jsonb_build_object('id', bm.id,
                                          'code', bm.code,
                                          'name', bm.name,
                                          'specification', bm.specification,
                                          'qualityGuaranteePeriod', bm.quality_guarantee_period,
                                          'defaultUnit',
                                          to_jsonb(bu.*))                                               AS material
                FROM inventory_operation_cte ioc
                         INNER JOIN base_materials bm ON ioc.material_id = bm.id
                         INNER JOIN base_units bu ON bm.default_unit_id = bu.id
                         LEFT JOIN base_lots bl ON ioc.lot_num = bl.lot_num and ioc.material_id = bl.material_id
                         LEFT JOIN inventory_operation_goods_agg_cte iogc ON ioc.operation_id = iogc.operation_id
                    AND ioc.material_id = iogc.material_id
                    AND ioc.lot_num = iogc.lot_num)
SELECT r.*
FROM result r;
  `;
  if (input.modify) {
    stmt = `
      WITH inventory_good_transfers_cte AS (SELECT operation_id,
                                                   material_id,
                                                   lot_num,
                                                   SUM(quantity) AS completed_amount
                                            FROM mom_good_transfers
                                            WHERE operation_id = $1
                                            GROUP BY operation_id,
                                                     material_id,
                                                     lot_num),
           inventory_operation_cte AS (SELECT mgt.operation_id,
                                              mgt.material_id,
                                              mgt.lot_num,
                                              coalesce(mgt.completed_amount, 0) AS completed_amount
                                       FROM inventory_good_transfers_cte mgt
                                       WHERE 1 = 1
                                         AND mgt.operation_id = $1),
           inventory_operation_goods_cte AS (SELECT ioc.operation_id,
                                                    mg.*,
                                                    SUM(mg.quantity) OVER (PARTITION BY mg.material_id,
                                                      mg.lot_num, mg.lot_id ORDER BY mg.validity_date ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity
                                             FROM mom_goods mg
                                                    INNER JOIN inventory_operation_cte ioc
                                                               ON mg.material_id = ioc.material_id
                                                                 AND mg.lot_num = ioc.lot_num
                                             ORDER BY mg.validity_date DESC),
           inventory_operation_goods_agg_cte AS (SELECT iogc.operation_id,
                                                        iogc.material_id,
                                                        iogc.lot_num,
                                                        iogc.lot_id,
                                                        jsonb_agg(jsonb_build_object('id',
                                                                                     iogc.id,
                                                                                     'binNum',
                                                                                     iogc.bin_num,
                                                                                     'validityDate',
                                                                                     iogc.validity_date,
                                                                                     'quantity',
                                                                                     iogc.quantity,
                                                                                     'cumulativeQuantity',
                                                                                     iogc.cumulative_quantity,
                                                                                     'location',
                                                                                     to_jsonb(bl.*))) AS goods
                                                 FROM inventory_operation_goods_cte iogc
                                                        INNER JOIN base_locations bl ON iogc.location_id = bl.id
                                                 GROUP BY iogc.operation_id,
                                                          iogc.material_id,
                                                          iogc.lot_num,
                                                          iogc.lot_id),
           result AS (SELECT ioc.*,
                             jsonb_build_object('id', bl.id, 'state', bl.state, 'lotNum', bl.lot_num, 'sourceType',
                                                bl.source_type, 'manufactureDate', bl.manufacture_date, 'expireTime',
                                                bl.expire_time, 'qualificationState', bl.qualification_state) AS lot,
                             iogc.goods,
                             jsonb_build_object('id', bm.id,
                                                'code', bm.code,
                                                'name', bm.name,
                                                'specification', bm.specification,
                                                'qualityGuaranteePeriod', bm.quality_guarantee_period,
                                                'defaultUnit',
                                                to_jsonb(bu.*))                                               AS material
                      FROM inventory_operation_cte ioc
                             INNER JOIN base_materials bm ON ioc.material_id = bm.id
                             INNER JOIN base_units bu ON bm.default_unit_id = bu.id
                             LEFT JOIN base_lots bl ON ioc.lot_num = bl.lot_num and ioc.material_id = bl.material_id
                             LEFT JOIN inventory_operation_goods_agg_cte iogc ON ioc.operation_id = iogc.operation_id
                        AND ioc.material_id = iogc.material_id
                        AND ioc.lot_num = iogc.lot_num)
      SELECT r.*
      FROM result r;
    `;
  }

  const transfers = await server.queryDatabaseObject(stmt, [input.operationId], routeContext.getDbTransactionClient());

  const transferOutputs = transfers.map((item) => {
    return {
      operationId: item.operation_id,
      material: item.material,
      lotNum: item.lot_num,
      totalAmount: item.total_amount,
      completedAmount: item.completed_amount,
      waitingAmount: item.waiting_amount,
      lot: item.lot,
      goods: item.goods,
    } as QueryGoodOutTransferOutput;
  });

  return transferOutputs;
}
