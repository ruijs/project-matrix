import { RockEventHandlerConfig } from "@ruiapp/move-style";
import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfIconRockConfig extends LinkshopWidgetRockConfig {
  icon: string;

  color: string;

  size?: number;

  list: { id: number; key: string; value: string };

  onChange?: RockEventHandlerConfig;

  value: string
}
