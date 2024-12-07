import type { SimpleRockConfig } from "@ruiapp/move-style";

export interface IotPropertyValueTendencyChartRockConfig extends SimpleRockConfig {
  thingId?: number;
  propertyCode?: string;
  width?: string;
  height?: string;
  step?: boolean;
}
