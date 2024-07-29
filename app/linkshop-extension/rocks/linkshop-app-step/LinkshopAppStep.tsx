import type { Rock } from "@ruiapp/move-style";
import ShopfloorAppStepMeta from "./LinkshopAppStepMeta";
import { renderRockChildren } from "@ruiapp/react-renderer";
import type { LinkshopAppStepRockConfig } from "~/linkshop-extension/linkshop-types";

import stepActionMap from "./step-actions";

export default {
  onReceiveMessage(message, state, props) {
    const stepAction = stepActionMap[message.name];
    if (typeof stepAction === "function") {
      stepAction(message, state, props);
    }
  },

  Renderer(context, props: LinkshopAppStepRockConfig) {
    const { backgroundColor, children } = props;

    return (
      <div style={{ position: "relative", width: "100%", height: "100%", backgroundColor }}>
        {renderRockChildren({ context, rockChildrenConfig: children || [] })}
      </div>
    );
  },

  ...ShopfloorAppStepMeta,
} as Rock;
