import type {ActionHandlerContext, IRpdServer, ServerOperation} from "@ruiapp/rapid-core";

export type QueryInput = {
  limit: number;
  offset: number;
};

export type QueryOutput = {};


export default {
  code: "listRawMaterialInspections",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;
    const input: QueryInput = ctx.input;

    if (input.limit === undefined || input.limit <= 0) {
      input.limit = 100
    }
    if (input.offset == undefined || input.offset < 0) {
      input.offset = 0
    }

    const transferOutputs = await listRawMaterialInspections(server, input);

    ctx.output = transferOutputs;
  },
} satisfies ServerOperation;

async function listRawMaterialInspections(server: IRpdServer, input: QueryInput) {

  const totalCount = await server.queryDatabaseObject(
    `
      with measurement_window_cte AS (select mim.sheet_id,
                                             mic.name,
                                             mim.quantitative_value,
                                             mim.qualitative_value,
                                             row_number()
                                             over (partition by mim.sheet_id, mic.name order by mic.created_at desc) as round
                                      from mom_inspection_measurements mim
                                             inner join mom_inspection_characteristics mic
                                                        on mim.characteristic_id = mic.id),
           measurements_values_cte AS (select mim.sheet_id,
                                              mim.name,
                                              ARRAY_AGG(CONCAT('第', mim.round, '次', '-',
                                                               COALESCE(mim.qualitative_value::TEXT,
                                                                        mim.quantitative_value::TEXT))
                                                        ORDER BY mim.round ASC) as values
                                       from measurement_window_cte mim
                                       group by sheet_id, mim.name),
           measurements_cte AS (select mim.sheet_id,
                                       jsonb_agg(jsonb_build_object('name', mim.name, 'value',
                                                                    array_to_string(mim.values, ','))) as measurements
                                from measurements_values_cte mim
                                group by sheet_id)
      SELECT count(*) as cnt
      FROM mom_inspection_sheets mis
             INNER JOIN base_materials bm ON mis.material_id = bm.id
             INNER JOIN base_material_categories bmc ON get_root_category_id(bm.category_id) = bmc.id
             LEFT JOIN mom_good_transfers mgt
                       ON mis.inventory_operation_id = mgt.operation_id and mgt.lot_num = mis.lot_num
             LEFT JOIN oc_users ou ON mis.inspector_id = ou.id
             INNER JOIN base_lots bl ON mis.lot_id = bl.id
             INNER JOIN measurements_cte mc ON mis.id = mc.sheet_id
      WHERE bmc.name = '原材料';
    `,
  );

  const results = await server.queryDatabaseObject(
    `
      with measurement_window_cte AS (select mim.sheet_id,
                                             mic.name,
                                             mim.quantitative_value,
                                             mim.qualitative_value,
                                             row_number()
                                             over (partition by mim.sheet_id, mic.name order by mic.created_at desc) as round
                                      from mom_inspection_measurements mim
                                             inner join mom_inspection_characteristics mic
                                                        on mim.characteristic_id = mic.id),
           measurements_values_cte AS (select mim.sheet_id,
                                              mim.name,
                                              ARRAY_AGG(CONCAT('第', mim.round, '次', '-',
                                                               COALESCE(mim.qualitative_value::TEXT,
                                                                        mim.quantitative_value::TEXT))
                                                        ORDER BY mim.round ASC) as values
                                       from measurement_window_cte mim
                                       group by sheet_id, mim.name),
           measurements_cte AS (select mim.sheet_id,
                                       jsonb_agg(jsonb_build_object('name', mim.name, 'value',
                                                                    array_to_string(mim.values, ','))) as measurements
                                from measurements_values_cte mim
                                group by sheet_id)
      SELECT mis.id,
             DATE(mis.created_at)                                              AS inspection_date,
             concat(bm.code, '-', bm.code, '-', bm.specification)              AS material_name,
             mis.lot_num                                                       AS lot_num,
             CASE WHEN mis.result = 'qualified' THEN '合格' ELSE '不合格' END  AS result,
             CASE
               WHEN mis.treatment = 'special' THEN '特采'
               WHEN mis.treatment = 'return' THEN '退货'
               ELSE '' END                                                     AS treatment,
             bl.manufacture_date                                               AS manufacture_date,
             mgt.quantity                                                      AS quantity,
             mis.sample_count                                                  AS sample_count,
             CASE WHEN mis.state = 'inspected' THEN '已完成' ELSE '检验中' END AS state,
             ou.name                                                           AS inspector,
             to_char(mis.inspected_at, 'YYYY-MM-DD')                           AS inspected_date,
             to_char(mis.inspected_at, 'HH24:MI:SS')                           AS inspected_time,
             mis.inspected_at,
             mis.remark                                                        AS remark,
             mc.measurements
      FROM mom_inspection_sheets mis
             INNER JOIN base_materials bm ON mis.material_id = bm.id
             INNER JOIN base_material_categories bmc ON get_root_category_id(bm.category_id) = bmc.id
             LEFT JOIN mom_good_transfers mgt
                       ON mis.inventory_operation_id = mgt.operation_id and mgt.lot_num = mis.lot_num
             LEFT JOIN oc_users ou ON mis.inspector_id = ou.id
             INNER JOIN base_lots bl ON mis.lot_id = bl.id
             INNER JOIN measurements_cte mc ON mis.id = mc.sheet_id
      WHERE bmc.name = '原材料' LIMIT $1 OFFSET $2;
    `,
    [input.limit, input.offset]
  );

  const items = results.map((item) => {
    return {
      id: item.id,
      inspectionDate: item.inspection_date,
      materialName: item.material_name,
      lotNum: item.lot_num,
      result: item.result,
      treatment: item.treatment,
      manufactureDate: item.manufacture_date,
      quantity: item.quantity,
      sampleCount: item.sample_count,
      state: item.state,
      inspector: item.inspector,
      inspectedDate: item.inspected_date,
      inspectedTime: item.inspected_time,
      remark: item.remark,
      measurements: item.measurements,
    } as QueryOutput;
  });

  return {
    total: totalCount[0].cnt,
    limit: input.limit,
    offset: input.offset,
    items: items,
  };
}
