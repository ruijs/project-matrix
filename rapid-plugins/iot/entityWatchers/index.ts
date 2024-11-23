import type { EntityWatcher } from "@ruiapp/rapid-core";
import IotGatewayEntityWatchers from "./IotGatewayEntityWatchers";
import IotThingEntityWatchers from "./IotThingEntityWatchers";
import IotTypeEntityWatchers from "./IotTypeEntityWatchers";

export default [...IotGatewayEntityWatchers, ...IotThingEntityWatchers, ...IotTypeEntityWatchers] satisfies EntityWatcher<any>[];
