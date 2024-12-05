import type { EntityWatcher } from "@ruiapp/rapid-core";
import IotGatewayEntityWatchers from "./IotGatewayEntityWatchers";
import IotPropertyEntityWatchers from "./IotPropertyEntityWatchers";
import IotThingEntityWatchers from "./IotThingEntityWatchers";
import IotTypeEntityWatchers from "./IotTypeEntityWatchers";

export default [...IotGatewayEntityWatchers, ...IotPropertyEntityWatchers, ...IotThingEntityWatchers, ...IotTypeEntityWatchers] satisfies EntityWatcher<any>[];
