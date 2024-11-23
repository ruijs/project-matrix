import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";

export default [
  {
    eventName: "entity.create",
    modelSingularCode: "iot_type",
    handler: async (ctx: EntityWatchHandlerContext<"entity.create">) => {
      const { payload } = ctx;

      // const changes: Partial<IotType> = payload.changes;
      // const after: Partial<IotType> = payload.after;

      console.log("iot_type created", payload);
    },
  },
] satisfies EntityWatcher<any>[];
