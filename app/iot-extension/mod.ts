import type { RuiExtension } from "@ruiapp/move-style";
import rocks from "./rocks";
import eventActions from "./event-actions";
import functions from "./functions";
import configProcessors from "./config-processors";
import stores from "./stores";

export default {
  stores,
  rocks,
  eventActions,
  functions,
  configProcessors,
} as RuiExtension;
