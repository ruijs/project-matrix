import type { EntityWatcher, EntityWatchHandlerContext, IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import { find, min } from "lodash";
import {
  type BaseLot,
  MomGoodTransfer,
  MomInventoryBusinessType,
  MomInventoryOperation,
  MomMaterialInventoryBalance,
  MomWorkOrder,
  type SaveBaseLotInput,
  SaveMomInventoryOperationInput,
} from "~/_definitions/meta/entity-types";
import rapidApi from "~/rapidApi";
import dayjs from "dayjs";

export default [
  {
    eventName: "entity.update",
    modelSingularCode: "mom_work_order",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, routerContext: routeContext, payload } = ctx;
      const { changes, after } = payload;

      try {
        if (changes.assignmentState === "assigned") {
          await handleWorkOrderMaterialRequirements(server, routeContext, after.id, true);
        }

        if (changes.executionState === "completed") {
          await handleCompletedWorkOrder(server, routeContext, after.id);
          await handleWorkOrderMaterialRequirements(server, routeContext, after.id, false);
        }
      } catch (error) {
        console.error(`Error updating inventory for work order ID ${after.id}:`, error);
      }
    },
  },
] satisfies EntityWatcher<any>[];

async function handleWorkOrderMaterialRequirements(server: IRpdServer, routeContext: RouteContext, workOrderId: string, isAssign: boolean) {
  const res = await rapidApi.post(`app/calcWorkOrderMaterialRequirements?workOrderId=${workOrderId}`);
  const { materials, output: mrpOutput } = res.data;

  const inventoryManager = server.getEntityManager<MomMaterialInventoryBalance>("mom_material_inventory_balance");

  for (const item of mrpOutput.requirements) {
    const { demand, available } = item.quantities;
    const allocated = min([demand, available])!;
    const material = find(materials, { code: item.code })!;
    const tags = item.tags;
    const inventory = await inventoryManager.findEntity({
      routeContext,
      filters: [
        { operator: "eq", field: "material_id", value: material.id },
        { operator: "eq", field: "tags", value: tags || "" },
      ],
    });

    if (inventory) {
      const updatedAllocatedQuantity = isAssign ? inventory?.allocatedQuantity + allocated : inventory?.allocatedQuantity || 0 - allocated;
      await inventoryManager.updateEntityById({
        routeContext,
        id: inventory.id,
        entityToSave: {
          allocatedQuantity: updatedAllocatedQuantity,
        } as Partial<MomMaterialInventoryBalance>,
      });
    } else {
      console.warn(`Inventory not found for material ID ${material.id} with tags ${tags || ""}`);
    }
  }
}

async function handleCompletedWorkOrder(server: IRpdServer, routeContext: RouteContext, workOrderId: string) {
  const workOrder = await fetchWorkOrderDetails(server, routeContext, workOrderId);
  const inventoryBusinessType = await fetchInventoryBusinessType(server, routeContext, "生产入库");

  if (!workOrder || !inventoryBusinessType) return;

  const transfers = await generateTransfers(server, routeContext, workOrder);
  const inventoryOperationInput = createInventoryOperationInput(inventoryBusinessType, transfers);

  const inventoryOperation = await server.getEntityManager<MomInventoryOperation>("mom_inventory_operation").createEntity({
    routeContext,
    entity: inventoryOperationInput,
  });

  if (inventoryOperation) {
    await server.getEntityManager<MomInventoryOperation>("mom_inventory_operation").updateEntityById({
      routeContext,
      id: inventoryOperation.id,
      entityToSave: {
        state: "done",
        approvalState: "approved",
      } as Partial<MomInventoryOperation>,
    });
  }
}

async function fetchWorkOrderDetails(server: IRpdServer, routeContext: RouteContext, workOrderId: string) {
  return server.getEntityManager<MomWorkOrder>("mom_work_order").findEntity({
    routeContext,
    filters: [{ operator: "eq", field: "id", value: workOrderId }],
    properties: ["id", "material", "unit", "quantity", "tags", "code", "operationType", "workReports"],
  });
}

async function fetchInventoryBusinessType(server: IRpdServer, routeContext: RouteContext, name: string) {
  return server.getEntityManager<MomInventoryBusinessType>("mom_inventory_business_type").findEntity({
    routeContext,
    filters: [{ operator: "eq", field: "name", value: name }],
    properties: ["id", "operationType"],
  });
}

async function generateTransfers(server: IRpdServer, routeContext: RouteContext, workOrder: MomWorkOrder) {
  const validityDate = dayjs(workOrder.createdAt)
    .add(parseInt(workOrder?.material?.qualityGuaranteePeriod || "0", 10), "day")
    .format("YYYY-MM-DD");

  const lotInfo = await saveMaterialLotInfo(server, routeContext, {
    lotNum: workOrder.code,
    material: { id: workOrder.material?.id },
    sourceType: "selfMade",
    qualificationState: "qualified",
    isAOD: false,
    state: "normal",
  });

  const qualifiedQuantity = workOrder.workReports.reduce((total: number, report: any) => total + (report?.qualifiedQuantity || 0), 0);

  return [
    {
      material: { id: workOrder.material?.id },
      unit: { id: workOrder.unit?.id },
      quantity: qualifiedQuantity,
      lotNum: workOrder.code,
      manufactureDate: workOrder.createdAt,
      validityDate: validityDate,
      lot: { id: lotInfo?.id },
      tags: workOrder.tags,
      orderNum: 1,
    },
  ] as MomGoodTransfer[];
}

function createInventoryOperationInput(inventoryBusinessType: MomInventoryBusinessType, transfers: MomGoodTransfer[]) {
  return {
    operationType: inventoryBusinessType.operationType,
    state: "processing",
    approvalState: "uninitiated",
    businessType: { id: inventoryBusinessType.id },
    transfers,
  } as SaveMomInventoryOperationInput;
}

async function saveMaterialLotInfo(server: IRpdServer, routeContext: RouteContext, lot: SaveBaseLotInput) {
  if (!lot.lotNum || !lot.material?.id) {
    throw new Error("lotNum and material are required when saving lot info.");
  }

  const baseLotManager = server.getEntityManager<BaseLot>("base_lot");
  const lotInDb = await baseLotManager.findEntity({
    routeContext,
    filters: [
      { operator: "eq", field: "lot_num", value: lot.lotNum },
      { operator: "eq", field: "material_id", value: lot.material.id },
    ],
  });

  return lotInDb || (await baseLotManager.createEntity({ routeContext, entity: lot }));
}
