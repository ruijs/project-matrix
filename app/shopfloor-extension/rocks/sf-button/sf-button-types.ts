import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfButtonRockConfig extends LinkshopWidgetRockConfig {
  text: string;

  icon?: string;

  backgroundColor?: string;
  color?: string;

  iconPosition?: "left" | "right" | "top";
}
