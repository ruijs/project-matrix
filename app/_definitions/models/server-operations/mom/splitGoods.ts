import type { ActionHandlerContext, IRpdServer, RouteContext, ServerOperation } from "@ruiapp/rapid-core";
import type { MomGood, SaveMomGoodInput } from "~/_definitions/meta/entity-types";
import SequenceService, { GenerateSequenceNumbersInput } from "@ruiapp/rapid-core/src/plugins/sequence/SequenceService";

export type SplitGoodsInput = {
  originGoodId: number;
  shelves: {
    weight: number;
    binNum?: string;
  }[];
};

// 标识卡拆分操作接口
export default {
  code: "splitGoods",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext } = ctx;
    const input: SplitGoodsInput = ctx.input;

    await splitGoods(server, routerContext, input);

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;

async function splitGoods(server: IRpdServer, routeContext: RouteContext, input: SplitGoodsInput) {
  const sequenceService = server.getService<SequenceService>("sequenceService");

  const goodManager = server.getEntityManager<MomGood>("mom_good");

  const originGood = await goodManager.findEntity({
    routeContext,
    filters: [
      {
        operator: "and",
        filters: [
          { operator: "eq", field: "id", value: input.originGoodId },
          { operator: "eq", field: "state", value: "normal" },
        ],
      },
    ],
    properties: ["id", "lotNum", "binNum", "material", "location", "quantity", "manufactureDate", "validityDate", "unit", "putInTime", "lot"],
  });

  if (!originGood) {
    throw new Error("原标识卡不存在或已拆分");
  }

  const originGoodQuantity = originGood.quantity || 0;
  const totalWeight = input.shelves.reduce((acc, curr) => acc + curr.weight, 0);
  if (originGoodQuantity <= 0 || originGoodQuantity !== totalWeight) {
    throw new Error("拆分项重量总和需要与原标识卡重量一致");
  }

  const saveGoodInputBase: SaveMomGoodInput = {
    material: originGood.material,
    materialCode: originGood?.material?.code,
    manufactureDate: originGood.manufactureDate,
    validityDate: originGood.validityDate,
    putInTime: originGood.putInTime,
    unit: originGood.unit,
    location: originGood.location,
    lotNum: originGood.lotNum,
    source: originGood,
    state: "normal",
  };

  if (originGood.lot) {
    saveGoodInputBase.lot = originGood.lot;
  }

  if (!originGood.binNum) {
    throw new Error("原标识卡没有托盘信息");
  }

  let originBinNum = originGood.binNum;
  // 检查 originBinNum 中包含两个 '-'
  if ((originBinNum.match(/-/g) || []).length === 2) {
    originBinNum = originBinNum.split("-").slice(0, 2).join("-");
  }

  const binNums = await sequenceService.generateSn(routeContext, server, {
    ruleCode: "qixiang.binNum.split",
    amount: input.shelves.length,
    parameters: {
      originBinNum: originBinNum,
    },
  } as GenerateSequenceNumbersInput);

  input.shelves.forEach((shelve, index) => {
    shelve.binNum = binNums[index];
  });

  for (const shelve of input.shelves) {
    const saveGoodInput = {
      ...saveGoodInputBase,
      binNum: shelve.binNum,
      quantity: shelve.weight,
    };

    await goodManager.createEntity({ routeContext, entity: saveGoodInput });
  }

  await goodManager.updateEntityById({
    routeContext,
    id: originGood.id,
    entityToSave: { state: "splitted" } as SaveMomGoodInput,
  });
}

export async function updateInventoryBalance(server: IRpdServer) {
  await server.queryDatabaseObject(
    `
      WITH material_balance AS (SELECT material_id,
                                       unit_id,
                                       tags,
                                       SUM(CASE WHEN state = 'normal' THEN quantity ELSE 0 END) AS on_hand_quantity
                                FROM mom_goods
                                where state = 'normal'
                                GROUP BY material_id, unit_id, tags),
           updated AS (
             UPDATE mom_material_inventory_balances mbi
               SET available_quantity = mb.on_hand_quantity,
                 on_hand_quantity = mb.on_hand_quantity,
                 updated_at = NOW()
               FROM material_balance mb
               WHERE mbi.material_id = mb.material_id
                 AND COALESCE(mbi.tags, '') = COALESCE(mb.tags, '')
                 AND mbi.unit_id = mb.unit_id
               RETURNING mbi.*),
           inserted AS (
             INSERT INTO mom_material_inventory_balances (material_id, tags, unit_id, available_quantity, on_hand_quantity,
                                                          created_at, updated_at)
               SELECT mb.material_id,
                      mb.tags,
                      mb.unit_id,
                      mb.on_hand_quantity,
                      mb.on_hand_quantity,
                      NOW(),
                      NOW()
               FROM material_balance mb
               WHERE NOT EXISTS (SELECT 1
                                 FROM updated u
                                 WHERE u.material_id = mb.material_id
                                   AND COALESCE(u.tags, '') = COALESCE(mb.tags, '')
                                   AND u.unit_id = mb.unit_id)
               RETURNING material_id, tags)
      DELETE
      FROM mom_material_inventory_balances mbi
      WHERE NOT EXISTS (SELECT 1
                        FROM material_balance mb
                        WHERE mbi.material_id = mb.material_id
                          AND COALESCE(mbi.tags, '') = COALESCE(mb.tags, '')
                          AND mbi.unit_id = mb.unit_id);
    `,
    [],
  );

  await server.queryDatabaseObject(
    `
      WITH lot_balance AS (SELECT material_id,
                                  tags,
                                  unit_id,
                                  lot_num,
                                  lot_id,
                                  SUM(CASE WHEN state = 'normal' THEN quantity ELSE 0 END) AS on_hand_quantity
                           FROM mom_goods
                           where state = 'normal'
                           GROUP BY material_id, tags, unit_id, lot_num, lot_id),
           updated AS (
             UPDATE mom_material_lot_inventory_balances mlb
               SET on_hand_quantity = lb.on_hand_quantity,
                 lot_num = lb.lot_num,
                 updated_at = NOW()
               FROM lot_balance lb
               WHERE mlb.material_id = lb.material_id
                 AND COALESCE(mlb.tags, '') = COALESCE(lb.tags, '')
                 AND mlb.lot_id = lb.lot_id
                 AND mlb.unit_id = lb.unit_id
               RETURNING mlb.*),
           inserted AS (
             INSERT INTO mom_material_lot_inventory_balances (material_id, tags, unit_id, lot_num, lot_id, on_hand_quantity,
                                                              created_at,
                                                              updated_at)
               SELECT lb.material_id,
                      lb.tags,
                      lb.unit_id,
                      lb.lot_num,
                      lb.lot_id,
                      lb.on_hand_quantity,
                      NOW(),
                      NOW()
               FROM lot_balance lb
               WHERE NOT EXISTS (SELECT 1
                                 FROM updated u
                                 WHERE u.material_id = lb.material_id
                                   AND COALESCE(u.tags, '') = COALESCE(lb.tags, '')
                                   AND u.lot_id = lb.lot_id
                                   AND lb.unit_id = u.unit_id)
               RETURNING material_id, tags, lot_id)
      DELETE
      FROM mom_material_lot_inventory_balances mlb
      WHERE NOT EXISTS (SELECT 1
                        FROM lot_balance lb
                        WHERE mlb.material_id = lb.material_id
                          AND COALESCE(mlb.tags, '') = COALESCE(lb.tags, '')
                          AND mlb.lot_id = lb.lot_id
                          and mlb.unit_id = lb.unit_id);
    `,
    [],
  );

  await server.queryDatabaseObject(
    `
      WITH lot_warehouse_balance AS (SELECT material_id,
                                            tags,
                                            unit_id,
                                            lot_num,
                                            lot_id,
                                            warehouse_id,
                                            SUM(CASE WHEN state = 'normal' THEN quantity ELSE 0 END) AS on_hand_quantity
                                     FROM mom_goods
                                     where state = 'normal'
                                     GROUP BY material_id, tags, unit_id, lot_num, lot_id, warehouse_id),
           updated AS (
             UPDATE mom_material_lot_warehouse_inventory_balances mlwb
               SET on_hand_quantity = lwb.on_hand_quantity,
                 lot_num = lwb.lot_num,
                 updated_at = NOW()
               FROM lot_warehouse_balance lwb
               WHERE mlwb.material_id = lwb.material_id
                 AND COALESCE(mlwb.tags, '') = COALESCE(lwb.tags, '')
                 AND mlwb.lot_id = lwb.lot_id
                 AND mlwb.warehouse_id = lwb.warehouse_id
                 AND mlwb.unit_id = lwb.unit_id
               RETURNING mlwb.*),
           inserted AS (
             INSERT INTO mom_material_lot_warehouse_inventory_balances (material_id, tags, unit_id, lot_num, lot_id,
                                                                        warehouse_id,
                                                                        on_hand_quantity, created_at, updated_at)
               SELECT lwb.material_id,
                      lwb.tags,
                      lwb.unit_id,
                      lwb.lot_num,
                      lwb.lot_id,
                      lwb.warehouse_id,
                      lwb.on_hand_quantity,
                      NOW(),
                      NOW()
               FROM lot_warehouse_balance lwb
               WHERE NOT EXISTS (SELECT 1
                                 FROM updated u
                                 WHERE u.material_id = lwb.material_id
                                   AND COALESCE(u.tags, '') = COALESCE(lwb.tags, '')
                                   AND u.lot_id = lwb.lot_id
                                   AND u.warehouse_id = lwb.warehouse_id
                                   AND u.unit_id = lwb.unit_id)
               RETURNING material_id, tags, lot_id, warehouse_id)
      DELETE
      FROM mom_material_lot_warehouse_inventory_balances mlwb
      WHERE NOT EXISTS (SELECT 1
                        FROM lot_warehouse_balance lwb
                        WHERE mlwb.material_id = lwb.material_id
                          AND COALESCE(mlwb.tags, '') = COALESCE(lwb.tags, '')
                          AND mlwb.lot_id = lwb.lot_id
                          AND mlwb.warehouse_id = lwb.warehouse_id
                          AND mlwb.unit_id = lwb.unit_id);
    `,
    [],
  );

  await server.queryDatabaseObject(
    `
      WITH warehouse_balance AS (SELECT material_id,
                                        tags,
                                        unit_id,
                                        warehouse_id,
                                        SUM(CASE WHEN state = 'normal' THEN quantity ELSE 0 END) AS on_hand_quantity
                                 FROM mom_goods
                                 where state = 'normal'
                                 GROUP BY material_id, tags, unit_id, warehouse_id),
           updated AS (
             UPDATE mom_material_warehouse_inventory_balances mwib
               SET on_hand_quantity = wb.on_hand_quantity,
                 updated_at = NOW()
               FROM warehouse_balance wb
               WHERE mwib.material_id = wb.material_id
                 AND COALESCE(mwib.tags, '') = COALESCE(wb.tags, '')
                 AND mwib.warehouse_id = wb.warehouse_id
                 AND mwib.unit_id = wb.unit_id
               RETURNING mwib.*),
           inserted AS (
             INSERT INTO mom_material_warehouse_inventory_balances (material_id, tags, unit_id, warehouse_id,
                                                                    on_hand_quantity,
                                                                    created_at, updated_at)
               SELECT wb.material_id,
                      wb.tags,
                      wb.unit_id,
                      wb.warehouse_id,
                      wb.on_hand_quantity,
                      NOW(),
                      NOW()
               FROM warehouse_balance wb
               WHERE NOT EXISTS (SELECT 1
                                 FROM updated u
                                 WHERE u.material_id = wb.material_id
                                   AND COALESCE(u.tags, '') = COALESCE(wb.tags, '')
                                   AND u.warehouse_id = wb.warehouse_id
                                   AND u.unit_id = wb.unit_id)
               RETURNING material_id, tags, warehouse_id)
      DELETE
      FROM mom_material_warehouse_inventory_balances mwib
      WHERE NOT EXISTS (SELECT 1
                        FROM warehouse_balance wb
                        WHERE mwib.material_id = wb.material_id
                          AND COALESCE(mwib.tags, '') = COALESCE(wb.tags, '')
                          AND mwib.warehouse_id = wb.warehouse_id
                          AND mwib.unit_id = wb.unit_id);
    `,
    [],
  );

  await server.queryDatabaseObject(
    `
      WITH location_balance AS (SELECT material_id,
                                       tags,
                                       unit_id,
                                       warehouse_id,
                                       location_id,
                                       SUM(CASE WHEN state = 'normal' THEN quantity ELSE 0 END) AS on_hand_quantity
                                FROM mom_goods
                                where state = 'normal'
                                GROUP BY material_id, tags, unit_id, warehouse_id, location_id),
           updated AS (
             UPDATE mom_material_warehouse_location_inventory_balances mwlb
               SET on_hand_quantity = lb.on_hand_quantity,
                 updated_at = NOW()
               FROM location_balance lb
               WHERE mwlb.material_id = lb.material_id
                 AND COALESCE(mwlb.tags, '') = COALESCE(lb.tags, '')
                 AND mwlb.warehouse_id = lb.warehouse_id
                 AND mwlb.location_id = lb.location_id
                 AND mwlb.unit_id = lb.unit_id
               RETURNING mwlb.*),
           inserted AS (
             INSERT INTO mom_material_warehouse_location_inventory_balances (material_id, tags, unit_id, warehouse_id,
                                                                             location_id,
                                                                             on_hand_quantity, created_at, updated_at)
               SELECT lb.material_id,
                      lb.tags,
                      lb.unit_id,
                      lb.warehouse_id,
                      lb.location_id,
                      lb.on_hand_quantity,
                      NOW(),
                      NOW()
               FROM location_balance lb
               WHERE NOT EXISTS (SELECT 1
                                 FROM updated u
                                 WHERE u.material_id = lb.material_id
                                   AND COALESCE(u.tags, '') = COALESCE(lb.tags, '')
                                   AND u.warehouse_id = lb.warehouse_id
                                   AND u.location_id = lb.location_id
                                   AND u.unit_id = lb.unit_id)
               RETURNING material_id, tags, warehouse_id, location_id)
      DELETE
      FROM mom_material_warehouse_location_inventory_balances mwlb
      WHERE NOT EXISTS (SELECT 1
                        FROM location_balance lb
                        WHERE mwlb.material_id = lb.material_id
                          AND COALESCE(mwlb.tags, '') = COALESCE(lb.tags, '')
                          AND mwlb.warehouse_id = lb.warehouse_id
                          AND mwlb.location_id = lb.location_id
                          AND mwlb.unit_id = lb.unit_id);
    `,
    [],
  );
}
