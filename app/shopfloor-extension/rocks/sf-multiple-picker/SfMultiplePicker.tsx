import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfMultiplePickerMeta from "./SfMultiplePickerMeta";
import type { SfMultiplePickerRockConfig } from "./sf-multiple-picker-types";
import { pick } from "lodash";

export default {
  Renderer(context, props: SfMultiplePickerRockConfig) {
    const {} = props;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";

    return <div data-component-id={props.$id} style={wrapStyle}></div>;
  },

  ...SfMultiplePickerMeta,
} as Rock;
