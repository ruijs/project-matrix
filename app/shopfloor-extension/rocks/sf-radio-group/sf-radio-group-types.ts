import { RockEventHandlerConfig } from "@ruiapp/move-style";
import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfRadioGroupRockConfig extends LinkshopWidgetRockConfig {
  value?: string;
  direction: "horizontal" | "vertical";
  fontSize: number;
  onChange?: RockEventHandlerConfig;
  list: { id: number; key: string; value: string }[];
}
