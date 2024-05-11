import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfSingleSelectorRockConfig extends LinkshopWidgetRockConfig {
  value?: string;
  onChange?(value: string): void;
}
