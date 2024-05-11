import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfSinglePickerRockConfig extends LinkshopWidgetRockConfig {
  dataSource: Record<string, any>[];
  labelKey?: string; // default value: label
  valueKey?: string; // default value: value
  value?: string;
  onChange?(value: string): void;
}
