import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import { CreateEventLogInput } from "../EventLogPluginTypes";
import { SysEventLog, SysEventType } from "~/_definitions/meta/entity-types";

export default class EventLogService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async createLog(input: CreateEventLogInput) {
    try {
      const eventLog: Partial<SysEventLog> = {
        sourceType: input.sourceType || "user",
        sourceName: input.sourceName,
        level: input.level || "info",
        message: input.message || "",
        targetTypeCode: input.targetTypeCode,
        targetCode: input.targetCode,
        targetId: input.targetId,
        targetName: input.targetName,
        details: input.details,
        data: input.data,
      };

      const { eventTypeCode, operatorId, time } = input;

      if (time) {
        eventLog.time = time;
      }

      if (operatorId) {
        eventLog.operator = { id: operatorId };
      }

      if (eventTypeCode) {
        const eventTypeManager = this.#server.getEntityManager<SysEventType>("sys_event_type");
        let eventType = await eventTypeManager.findEntity({
          filters: [
            {
              operator: "eq",
              field: "code",
              value: eventTypeCode,
            },
          ],
        });

        if (!eventType) {
          eventType = await eventTypeManager.createEntity({
            entity: {
              code: eventTypeCode,
              name: eventTypeCode,
            } as Partial<SysEventType>,
          });
        }
        eventLog.eventType = {
          id: eventType.id,
        };
      }

      await this.#server.getEntityManager<SysEventLog>("sys_event_log").createEntity({
        entity: eventLog,
        postponeUniquenessCheck: true,
      });
    } catch (error: any) {
      this.#server.getLogger().error(`创建事件日志失败：%s`, error.message, { error });
    }
  }
}
