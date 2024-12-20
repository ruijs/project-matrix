import { ActionHandlerContext, IRpdServer, mapDbRowToEntity, RouteContext, ServerOperation } from "@ruiapp/rapid-core";

export type ListLotsInput = {
  inspectRuleId: number;
  customerId: number;
  materialId: number;
};

export default {
  code: "listLotsByInspectRule",
  method: "POST",
  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext } = ctx;
    const input: ListLotsInput = ctx.input;

    ctx.output = await listLotsByInspectRule(server, routeContext, input);
  },
} satisfies ServerOperation;

async function listLotsByInspectRule(server: IRpdServer, routeContext: RouteContext, input: ListLotsInput) {
  const rows = await server.queryDatabaseObject(
    `
      with inspect_measurements_cte AS (select mim.sheet_id, mic.name, mim.qualitative_value, mim.quantitative_value
                                        from mom_inspection_measurements mim
                                               inner join mom_inspection_characteristics mic on mim.characteristic_id = mic.id),
           inspect_lot_cte AS (select mic.name,
                                      mic.must_pass,
                                      mic.kind,
                                      mic.norminal,
                                      imc.qualitative_value,
                                      imc.quantitative_value,
                                      imc.sheet_id,
                                      mis.material_id,
                                      mis.lot_num,
                                      mis.lot_id,
                                      case
                                        when must_pass is true then
                                          case
                                            when mic.kind = 'quantitative' then
                                              coalesce(case
                                                         when mic.determine_type = 'inTolerance' then
                                                           imc.quantitative_value <
                                                           (coalesce(norminal::DECIMAL, 0) + coalesce(upper_tol::DECIMAL, 0)) and
                                                           imc.quantitative_value >
                                                           (coalesce(norminal::DECIMAL, 0) + coalesce(lower_tol::DECIMAL, 0))
                                                         when mic.determine_type = 'inLimit' then
                                                           imc.quantitative_value <
                                                           (coalesce(norminal::DECIMAL, 0) + coalesce(upper_limit::DECIMAL, 0)) and
                                                           imc.quantitative_value >
                                                           (coalesce(norminal::DECIMAL, 0) + coalesce(lower_limit::DECIMAL, 0))
                                                         when mic.determine_type = 'gt'
                                                           then imc.quantitative_value > coalesce(norminal::DECIMAL, 0)
                                                         when mic.determine_type = 'gte'
                                                           then imc.quantitative_value >= coalesce(norminal::DECIMAL, 0)
                                                         when mic.determine_type = 'lt'
                                                           then imc.quantitative_value < coalesce(norminal::DECIMAL, 0)
                                                         when mic.determine_type = 'lte'
                                                           then imc.quantitative_value <= coalesce(norminal::DECIMAL, 0)
                                                         end, false)
                                            when mic.kind = 'qualitative' then
                                              case
                                                when mic.qualitative_determine_type notnull
                                                  then norminal = coalesce(imc.qualitative_value, '')
                                                end
                                            end
                                        else true
                                        end as result
                               from mom_inspection_characteristics mic
                                      inner join mom_inspection_rules mir on mic.rule_id = mir.id
                                      left join inspect_measurements_cte imc on mic.name = imc.name
                                      left join public.mom_inspection_sheets mis on imc.sheet_id = mis.id
                               where 1 = 1
                                 and mir.id = $1
                                 and mir.customer_id = $2
                                 and mir.material_id = $3),
           lot_result_cte AS (select material_id, lot_num, lot_id, bool_and(result) as result
                              from inspect_lot_cte
                              group by material_id, lot_num, lot_id)
      select mlb.*, lrc.result AS inspect_result, to_jsonb(bl.*) AS lot, to_jsonb(bm.*) AS material
      from lot_result_cte lrc
             inner join mom_material_lot_inventory_balances mlb on lrc.lot_id = mlb.lot_id
             inner join base_lots bl on lrc.lot_id = bl.id
             inner join base_materials bm on lrc.material_id = bm.id;
    `,
    [input.inspectRuleId, input.customerId, input.materialId],
    routeContext.getDbTransactionClient(),
  );

  const model = server.getModel({ singularCode: "mom_material_lot_inventory_balance" });

  return rows.map((item) => mapDbRowToEntity(server, model!, item, false));
}
