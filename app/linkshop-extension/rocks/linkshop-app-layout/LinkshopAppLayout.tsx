import type { Rock } from "@ruiapp/move-style";
import LinkshopAppLayoutMeta from "./LinkshopAppLayoutMeta";
import { renderRockChildren } from "@ruiapp/react-renderer";
import type { LinkshopAppLayoutRockConfig } from "~/linkshop-extension/linkshop-types";

export default {
  Renderer(context, props: LinkshopAppLayoutRockConfig) {
    const { backgroundColor, children } = props;

    return (
      <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor }}>
        {renderRockChildren({ context, rockChildrenConfig: children || [] })}
      </div>
    );
  },

  ...LinkshopAppLayoutMeta,
} as Rock;
