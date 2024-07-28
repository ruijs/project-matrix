import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfButtonMeta from "./SfButtonMeta";
import type { SfButtonRockConfig } from "./sf-button-types";
import { pick } from "lodash";
import { Button } from "antd";
import { convertToEventHandlers, renderRock } from "@ruiapp/react-renderer";

export default {
  Renderer(context, props: SfButtonRockConfig) {
    const { text, icon, iconPosition } = props;

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames, ...CommonProps.BorderStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";
    wrapStyle.backgroundColor = props.backgroundColor;
    wrapStyle.color = props.color;

    const eventHandlers = convertToEventHandlers({ context, rockConfig: props });

    return (
      <Button data-component-id={props.$id} style={wrapStyle} {...eventHandlers}>
        {icon &&
          renderRock({
            context,
            rockConfig: {
              $type: "antdIcon",
              name: icon,
            },
          })}
        {text}
      </Button>
    );
  },

  ...SfButtonMeta,
} as Rock;
