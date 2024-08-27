import { CommonProps, handleComponentEvent, type Rock } from "@ruiapp/move-style";
import SfTextMeta from "./SfTextInputMeta";
import type { SfTextInputRockConfig } from "./sf-text-input-types";
import { pick } from "lodash";

export default {
  Renderer(context, props: SfTextInputRockConfig) {
    const { framework, page, scope } = context;
    const {
      value = "",
      disabled,
      color,
      verticalAlignment,
      fontSize,
      letterSpacing,
      horizontalAlignment,
      fontWeightIsBold,
      fontStyleIsOblique,
      textDecorationLine,
      textDecorationStyle,
      textDecorationColor,
      onChange,
    } = props;

    const wrapStyle: React.CSSProperties = pick(props, [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames]) as any;
    wrapStyle.position = "absolute";
    wrapStyle.display = "flex";
    wrapStyle.flexDirection = "column";
    wrapStyle.color = color;
    wrapStyle.fontSize = fontSize;
    wrapStyle.letterSpacing = letterSpacing;
    wrapStyle.textAlign = horizontalAlignment;
    wrapStyle.justifyContent = verticalAlignment;
    wrapStyle.fontWeight = fontWeightIsBold === true ? "bold" : "normal";
    wrapStyle.fontStyle = fontStyleIsOblique === true ? "oblique" : "normal";
    wrapStyle.textDecorationLine = textDecorationLine;
    wrapStyle.textDecorationStyle = textDecorationStyle;
    wrapStyle.textDecorationColor = textDecorationColor;

    const onInputChange = (event: any) => {
      const value = event.target?.value;

      if (onChange) {
        handleComponentEvent("onChange", framework, page, scope, props, onChange, [value]);
      }
    };

    return (
      <div data-component-id={props.$id} style={wrapStyle}>
        <input style={inputStyle} disabled={disabled} value={value} onChange={onInputChange} />
      </div>
    );
  },

  ...SfTextMeta,
} as Rock;

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};
