import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidTableActionConfig } from "@ruiapp/rapid-extension";

export interface BatchDeleteActionRockConfig extends SimpleRockConfig, RapidTableActionConfig {
  title?: string;
  entityCode: string;
  tooltipText?: string;
}
