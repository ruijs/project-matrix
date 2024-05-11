import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfSingleSelectorMeta from "./SfSingleSelectorMeta";
import type { SfSingleSelectorRockConfig } from "./sf-single-selector-types";
import { pick } from "lodash";

export default {
  Renderer(context, props: SfSingleSelectorRockConfig) {
    const {} = props;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";

    return <div data-component-id={props.$id} style={wrapStyle}></div>;
  },

  ...SfSingleSelectorMeta,
} as Rock;
