import type { LinkshopWidgetRockConfig } from "~/linkshop-extension/mod";

interface IFile {
  url: string;
  id: string;
}

export interface SfImagePickerRockConfig extends LinkshopWidgetRockConfig {
  value?: IFile[];
  onChange?(value: IFile[]): void;
}
