import type { SimpleRockConfig } from "@ruiapp/move-style";
import type { RapidTableActionConfig } from "@ruiapp/rapid-extension";

export interface CreateBatchNumberActionRockConfig extends SimpleRockConfig, RapidTableActionConfig {
  title?: string;
  dataSourceAdapter?: string | ((...args: any[]) => any);
}
