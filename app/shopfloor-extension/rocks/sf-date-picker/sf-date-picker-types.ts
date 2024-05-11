import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfDatePickerRockConfig extends LinkshopWidgetRockConfig {
  value?: string;
  onChange?(value: string): void;
}
