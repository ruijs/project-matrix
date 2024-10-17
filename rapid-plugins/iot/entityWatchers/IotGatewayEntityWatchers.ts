import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import type { IotGateway } from "~/_definitions/meta/entity-types";
import { v4 as uuidv4 } from "uuid";

export default [
  {
    eventName: "entity.beforeCreate",
    modelSingularCode: "iot_gateway",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeCreate">) => {
      const { payload } = ctx;

      const before: Partial<IotGateway> = payload.before;

      before.accessToken = uuidv4();
    },
  },
] satisfies EntityWatcher<any>[];
