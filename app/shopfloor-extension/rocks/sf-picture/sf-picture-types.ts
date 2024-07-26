import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

export interface SfPictureRockConfig extends LinkshopWidgetRockConfig {
  url: string;
  borderStyle: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}
