import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfRectangleMeta from "./SfRectangleMeta";
import type { SfRectangleRockConfig } from "./sf-rectangle-types";
import { pick } from "lodash";
import { convertToEventHandlers } from "@ruiapp/react-renderer";
import React from "react";

export default {
  Renderer(context, props: SfRectangleRockConfig) {
    const { text } = props;
    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames, ...CommonProps.BorderStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";
    wrapStyle.backgroundColor = props.backgroundColor;
    wrapStyle.color = props.color;
    const eventHandlers = convertToEventHandlers({ context, rockConfig: props });
    return (
      <div data-component-id={props.$id} style={wrapStyle} {...eventHandlers}>
        {text}
      </div>
    );
  },

  ...SfRectangleMeta,
} as Rock;
