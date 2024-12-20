import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";
import { filter, find, get, map } from "lodash";
import type { MaterialBreakdown, MaterialInventory, MaterialItem, MRPInput } from "@linkfactory/algorithm-mrp";
import { performMRP } from "@linkfactory/algorithm-mrp";

export default {
  code: "calcWorkOrderMaterialRequirements",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { logger, server, routerContext: routeContext, input } = ctx;
    const workOrderId = parseInt(ctx.input.workOrderId, 10);
    const decisions = ctx.input.decisions || [];

    logger.debug("input", input);

    const scheduleItems = await server.queryDatabaseObject(
      `select *
                                                            from mom_work_orders
                                                            where id = ANY ($1::int[]);`,
      [[workOrderId]],
      routeContext.getDbTransactionClient(),
    );

    const units = await server.queryDatabaseObject(
      `select *
                                                    from base_units;`,
      [],
      routeContext.getDbTransactionClient(),
    );

    const materials = await server.queryDatabaseObject(
      `select *
                                                        from base_materials;`,
      [],
      routeContext.getDbTransactionClient(),
    );

    const breakdowns = await server.queryDatabaseObject(
      `select *
                                                         from mom_material_breakdowns
                                                         where material_id = ANY ($1::int[])`,
      [scheduleItems.map((item) => item.material_id)],
      routeContext.getDbTransactionClient(),
    );

    const breakdownParts = await server.queryDatabaseObject(
      `select *
                                                             from mom_material_breakdown_parts
                                                             where breakdown_id = ANY ($1::int[])`,
      [breakdowns.map((item) => item.id)],
      routeContext.getDbTransactionClient(),
    );

    const inventories = await server.queryDatabaseObject(
      `select *
                                                          from mom_material_inventory_balances;`,
      [],
      routeContext.getDbTransactionClient(),
    );

    const mrpBreakdowns: MaterialBreakdown[] = [];
    materials.forEach((material) => {
      const breakdown = find(breakdowns, { material_id: material.id });
      if (!breakdown) {
        return;
      }

      const parts = filter(breakdownParts, { breakdown_id: breakdown.id });
      mrpBreakdowns.push({
        code: get(material, "code"),
        tags: "",
        quantity: breakdown.quantity,
        unit: get(find(units, { id: breakdown.unit_id }), "name"),
        parts: parts.map((item) => {
          return {
            code: get(find(materials, { id: item.sub_material_id }), "code"),
            matchTags: item.match_tags,
            quantity: item.quantity,
            unit: get(find(units, { id: item.unit_id }), "name"),
          };
        }),
      });
    });

    const mrpInput: MRPInput = {
      demands: map(scheduleItems, (item) => {
        return {
          code: get(find(materials, { id: item.material_id }), "code"),
          tags: item.tags,
          quantity: item.quantity,
          unit: get(find(units, { id: item.unit_id }), "name"),
        } satisfies MaterialItem;
      }),
      breakdowns: mrpBreakdowns,
      inventories: map(inventories, (item) => {
        return {
          code: get(find(materials, { id: item.material_id }), "code"),
          tags: item.tags,
          quantities: {
            available: item.allocable_quantity,
            instock: item.instock_quantity,
            allocated: item.allocated_quantity,
            reserved: item.reserved_quantity,
          },
          unit: get(find(units, { id: item.unit_id }), "name"),
        } satisfies MaterialInventory;
      }),
      decisions: decisions,
    };
    let mrpOutput = performMRP(mrpInput);

    // exclude the materials that are in the demand list
    const materialsInDemands = map(mrpInput.demands, (item) => item.code);
    mrpOutput.requirements = filter(mrpOutput.requirements, (item) => {
      return !materialsInDemands.includes(item.code);
    });

    // if scheduleItems's assignmentState = assigned, updated mrpOutput.requirements.stockUp to demand amount
    scheduleItems.forEach((item) => {
      if (item.assignment_state === "assigned") {
        mrpOutput.requirements.forEach((material) => {
          material.quantities.stockUp = material.quantities.demand;
        });
      }
    });

    ctx.output = {
      materials: map(materials, (item) => {
        return {
          id: item.id,
          code: item.code,
          name: item.name,
          specification: item.specification,
          canProduce: item.can_produce,
          canPurchase: item.can_purchase,
          canOutsource: item.can_outsource,
        };
      }),
      input: mrpInput,
      output: mrpOutput,
    };
  },
} satisfies ServerOperation;
