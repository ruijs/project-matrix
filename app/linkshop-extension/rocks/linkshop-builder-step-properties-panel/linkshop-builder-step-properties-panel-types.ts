import type { SimpleRockConfig } from "@ruiapp/move-style";
import { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";

export interface LinkshopBuilderStepPropertiesPanelRockConfig extends SimpleRockConfig {
  designerStore: LinkshopAppDesignerStore;
}
