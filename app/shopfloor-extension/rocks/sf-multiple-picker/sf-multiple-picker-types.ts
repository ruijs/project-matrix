import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfMultiplePickerRockConfig extends LinkshopWidgetRockConfig {
  value?: string[];
  onChange?(value: string[]): void;
}
