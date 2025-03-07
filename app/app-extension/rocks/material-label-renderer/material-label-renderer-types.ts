import type { SimpleRockConfig } from "@ruiapp/move-style";

export interface MaterialLabelRendererRockConfig extends SimpleRockConfig {
  value?: {
    code?: string;
    name?: string;
    specification?: string;
  };
  hideCode?: boolean;
}
