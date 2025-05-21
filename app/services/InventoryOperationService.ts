import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import type { CreateEventLogInput } from "rapid-plugins/eventLog/EventLogPluginTypes";
import type { MomInventoryOperation } from "~/_definitions/meta/entity-types";
import { handleKisOperation } from "~/_definitions/models/server-operations/mom/handleKisOperation";
import type EventLogService from "rapid-plugins/eventLog/services/EventLogService";

export async function sendInventoryOperationSheetToErp(server: IRpdServer, routeContext: RouteContext, inventoryOperation: Partial<MomInventoryOperation>) {
  try {
    await handleKisOperation(server, routeContext, { operationId: inventoryOperation.id! });
  } catch (ex: any) {
    const eventLog: CreateEventLogInput = {
      sourceType: "app",
      level: "error",
      eventTypeCode: "kis.syncInternalToExternal",
      targetTypeCode: "mom_inventory_operation",
      targetCode: inventoryOperation.code,
      message: `KIS单据写入失败。WMS单号：${inventoryOperation.code}。${ex.message}`,
      details: ex.stack,
    };

    await server.getService<EventLogService>("eventLogService").createLog(eventLog);
    console.log(ex);
  }
}
