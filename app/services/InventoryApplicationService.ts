import { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import { MomInventoryApplication, MomInventoryApplicationItem } from "~/_definitions/meta/entity-types";

/**
 * 当出入库申请中所有批次的物料都检验完成，将出入库申请单的检验状态设置成已完成。
 * @param server
 * @param routeContext
 * @param inventoryApplication
 * @returns
 */
export async function refreshInventoryApplicationInspectionState(
  server: IRpdServer,
  routeContext: RouteContext,
  inventoryApplication?: Partial<MomInventoryApplication>,
) {
  if (!inventoryApplication) {
    return;
  }

  const momInventoryApplicationItemManager = server.getEntityManager<MomInventoryApplicationItem>("mom_inventory_application_item");
  const momInventoryApplicationItems = await momInventoryApplicationItemManager.findEntities({
    routeContext,
    filters: [{ operator: "eq", field: "operation_id", value: inventoryApplication.id }],
    properties: ["id", "inspectState"],
  });

  if (momInventoryApplicationItems.length > 0) {
    // every item has been inspected, then update the application state to inspected
    const allInspected = momInventoryApplicationItems.every((item) => item?.inspectState);

    const inspectionState: MomInventoryApplication["inspectState"] = allInspected ? "inspected" : "inspecting";
    if (allInspected) {
      await server.getEntityManager<MomInventoryApplication>("mom_inventory_application").updateEntityById({
        routeContext,
        id: inventoryApplication.id,
        entityToSave: {
          inspectState: inspectionState,
        } satisfies Partial<MomInventoryApplication>,
      });
    }
  }
}
