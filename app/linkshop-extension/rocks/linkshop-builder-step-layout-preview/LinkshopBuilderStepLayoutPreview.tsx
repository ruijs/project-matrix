import type { Rock, RockConfig } from "@ruiapp/move-style";
import LinkshopBuilderStepLayoutPreviewMeta from "./LinkshopBuilderStepLayoutPreviewMeta";
import type { LinkshopBuilderStepLayoutPreviewRockConfig } from "./linkshop-builder-step-layout-preview-types";
import { isArray } from "lodash";
import { renderRock } from "@ruiapp/react-renderer";

export default {
  Renderer(context, props: LinkshopBuilderStepLayoutPreviewRockConfig) {
    const { $id, backgroundColor, children } = props;

    let childrenRocks: any;
    if (children) {
      if (isArray(children)) {
        childrenRocks = children;
      } else {
        childrenRocks = [children];
      }
    } else {
      childrenRocks = [];
    }

    const rockConfig: RockConfig = {
      $id: `${$id}-bg`,
      $type: "box",
      style: {
        width: "100%",
        height: "100%",
        backgroundColor,
      },
      children: [
        ...childrenRocks,
        {
          $id: `${$id}-children-slot`,
          $type: "slot",
        },
      ],
    };

    return renderRock({
      context,
      rockConfig,
    });
  },

  ...LinkshopBuilderStepLayoutPreviewMeta,
} as Rock;
