import { RockEventHandlerConfig } from "@ruiapp/move-style";
import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfDateSelectRockConfig extends LinkshopWidgetRockConfig {
  value?: string;
  onChange?: RockEventHandlerConfig;
}
