import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";
import type { MRPInput, MRPOutput } from "@linkfactory/algorithm-mrp";
import type { BaseMaterial, CbsOrder, CbsOrderItem, MomManufacturingResourcePlan, MomWorkOrder } from "~/_definitions/meta/entity-types";
import { find } from "lodash";

type MrpResult = {
  demands: MRPInput["demands"];
  breakdowns: MRPInput["breakdowns"];
  inventories: MRPInput["inventories"];
  materials: BaseMaterial[];
  decisions: MRPInput["decisions"];
  requirements: MRPOutput["requirements"];
  actions: MRPOutput["actions"];
};

export default {
  code: "submitMrpResult",

  method: "POST",

  async handler(ctx: ActionHandlerContext) {
    const { server, routerContext: routeContext, input } = ctx;
    const mrpId = parseInt(input.mrpId, 10);
    const mrpResult: MrpResult = {
      demands: input.demands,
      breakdowns: input.breakdowns,
      inventories: input.inventories,
      materials: input.materials,
      decisions: input.decisions,
      requirements: input.requirements,
      actions: input.actions,
    };

    const mrpManager = server.getEntityManager<MomManufacturingResourcePlan>("mom_manufacturing_resource_plan");

    const updatedMrp = await mrpManager.updateEntityById({
      routeContext,
      id: mrpId,
      entityToSave: {
        planningState: "planned",
        result: mrpResult,
      },
    });

    // const mpsDataAccessor = server.getDataAccessor<MomMasterProductionSchedule>({
    //   singularCode: 'mom_master_production_schedule',
    // });

    await server.queryDatabaseObject(
      "update mom_master_production_schedules set schedule_state = $1 where mrp_id = $2",
      ["scheduled", mrpId],
      routeContext.getDbTransactionClient(),
    );

    const materials = await server.queryDatabaseObject(`select * from base_materials;`, [], routeContext.getDbTransactionClient());
    const units = await server.queryDatabaseObject(`select * from base_units;`, [], routeContext.getDbTransactionClient());

    // 生成工单
    const workOrderManager = server.getEntityManager<MomWorkOrder>("mom_work_order");
    const productionOrderItems = mrpResult.actions.productionOrderItems || [];
    for (const productionOrderItem of productionOrderItems) {
      const material = find(materials, { code: productionOrderItem.code });
      if (!material) {
        continue;
      }
      const unit = find(units, { name: productionOrderItem.unit });

      const workOrder = await workOrderManager.findEntity({
        routeContext,
        filters: [
          {
            operator: "eq",
            field: "mrp_id",
            value: mrpId,
          },
          {
            operator: "eq",
            field: "material_id",
            value: material.id,
          },
        ],
      });

      if (!workOrder) {
        const woCode = `WO-${updatedMrp.name}-${material.code}`;
        await workOrderManager.createEntity({
          routeContext,
          entity: {
            code: woCode,
            material: { id: material.id },
            quantity: productionOrderItem.quantity,
            unit,
            mrp: { id: mrpId },
            assignmentState: "unassigned",
            executionState: "pending",
          } as Partial<MomWorkOrder>,
        });
      }
    }

    // 生成采购订单
    const cbsOrderManager = server.getEntityManager<CbsOrder>("cbs_order");
    const cbsOrderItemManager = server.getEntityManager<CbsOrderItem>("cbs_order_item");
    const purchaseOrderItems = mrpResult.actions.purchaseOrderItems || [];
    for (const purchaseOrderItem of purchaseOrderItems) {
      const material = find(materials, { code: purchaseOrderItem.code });
      if (!material) {
        continue;
      }
      const unit = find(units, { name: purchaseOrderItem.unit });

      const cbsOrderItem = await cbsOrderItemManager.findEntity({
        routeContext,
        filters: [
          {
            operator: "eq",
            field: "mrp_id",
            value: mrpId,
          },
          {
            operator: "eq",
            field: "subject_id",
            value: material.id,
          },
        ],
      });

      if (!cbsOrderItem) {
        const poCode = `PO-${updatedMrp.name}-${material.code}`;
        const cbsOrder = await cbsOrderManager.createEntity({
          routeContext,
          entity: {
            code: "-",
            name: poCode,
            kind: "purchase",
            state: "unsigned",
            mrp: { id: mrpId },
          } as Partial<CbsOrder>,
        });

        await cbsOrderItemManager.createEntity({
          routeContext,
          entity: {
            orderNum: 1,
            order: { id: cbsOrder.id },
            mrp: { id: mrpId },
            name: material.name,
            subject: { id: material.id },
            quantity: purchaseOrderItem.quantity,
            unit,
            price: 0,
            taxRate: 0,
          } as Partial<CbsOrderItem>,
        });
      }
    }

    ctx.output = {
      result: ctx.input,
    };
  },
} satisfies ServerOperation;
