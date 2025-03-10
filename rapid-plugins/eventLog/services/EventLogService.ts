import type { IRpdServer, RouteContext } from "@ruiapp/rapid-core";
import { CreateEventLogInput } from "../EventLogPluginTypes";
import { SysEventLog, SysEventType } from "~/_definitions/meta/entity-types";

export default class EventLogService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async createLog(input: CreateEventLogInput) {
    const eventLog: Partial<SysEventLog> = {
      sourceType: input.sourceType || "user",
      sourceName: input.sourceName,
      level: input.level || "info",
      message: input.message || "",
    };

    if (input.time) {
      eventLog.time = input.time;
    }

    const { eventTypeCode } = input;

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
  }
}
