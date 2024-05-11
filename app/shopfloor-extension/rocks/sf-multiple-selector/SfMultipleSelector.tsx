import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfMultipleSelectorMeta from "./SfMultipleSelectorMeta";
import type { SfMultipleSelectorRockConfig } from "./sf-multiple-selector-types";
import { pick } from "lodash";

export default {
  Renderer(context, props: SfMultipleSelectorRockConfig) {
    const { value } = props;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";

    return (
      <div data-component-id={props.$id} style={wrapStyle}>
        {value}
      </div>
    );
  },

  ...SfMultipleSelectorMeta,
} as Rock;
