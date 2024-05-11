import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfMultipleSelectorRockConfig extends LinkshopWidgetRockConfig {
  value?: string[];
  onChange?(value: string[]): void;
}
