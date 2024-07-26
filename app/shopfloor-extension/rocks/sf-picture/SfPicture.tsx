import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfPictureMeta from "./SfPictureMeta";
import type { SfPictureRockConfig } from "./sf-picture-types";
import { pick } from "lodash";

export default {
  Renderer(context, props: SfPictureRockConfig) {
    const { fileObj = {} } = props;

    const url = `/api/download/file?inline=true&fileKey=${fileObj.fileKey}&fileName=${fileObj.fileName}&open=${open}`;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames, ...CommonProps.BorderStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";

    return (
      <div data-component-id={props.$id}>
        {fileObj.fileKey ? (
          <img alt="" style={wrapStyle} src={fileObj.fileKey ? url : ""} />
        ) : (
          <div style={{ ...wrapStyle, textAlign: "center" }}>暂无图片,请上传</div>
        )}
      </div>
    );
  },

  ...SfPictureMeta,
} as Rock;
