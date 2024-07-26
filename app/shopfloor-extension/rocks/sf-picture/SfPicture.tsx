import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfPictureMeta from "./SfPictureMeta";
import type { SfPictureRockConfig } from "./sf-picture-types";
import { pick } from "lodash";

export default {
  Renderer(context, props: SfPictureRockConfig) {
    const { fileObj = {}, borderStyle, borderRadius, borderColor, borderWidth } = props;

    const url = `/api/download/file?inline=true&fileKey=${fileObj.fileKey}&fileName=${fileObj.fileName}&open=${open}`;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";
    wrapStyle.borderStyle = borderStyle;
    wrapStyle.borderColor = borderColor;
    wrapStyle.borderWidth = borderWidth;
    wrapStyle.borderRadius = borderRadius;

    return <img data-component-id={props.$id} alt="" style={wrapStyle} src={url} />;
  },

  ...SfPictureMeta,
} as Rock;
