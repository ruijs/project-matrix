import type { Rock } from "@ruiapp/move-style";
import LinkshopBuilderStepLayoutPreviewMeta from "./LinkshopBuilderStepLayoutPreviewMeta";
import type { LinkshopBuilderStepLayoutPreviewRockConfig } from "./linkshop-builder-step-layout-preview-types";

export default {
  Renderer(context, props: LinkshopBuilderStepLayoutPreviewRockConfig) {
    const { shopfloorApp } = props;

    return "assets";
  },

  ...LinkshopBuilderStepLayoutPreviewMeta,
} as Rock;
