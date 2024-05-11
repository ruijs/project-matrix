import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfImagePickerMeta from "./SfImagePickerMeta";
import type { SfImagePickerRockConfig } from "./sf-image-picker-types";
import { pick } from "lodash";

export default {
  Renderer(context, props: SfImagePickerRockConfig) {
    const {} = props;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";

    return <div data-component-id={props.$id} style={wrapStyle}></div>;
  },

  ...SfImagePickerMeta,
} as Rock;
