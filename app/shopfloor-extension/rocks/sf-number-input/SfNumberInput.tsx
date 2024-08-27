import { CommonProps, handleComponentEvent, type Rock } from "@ruiapp/move-style";
import SfTextMeta from "./SfNumberInputMeta";
import type { SfNumberInputRockConfig } from "./sf-number-input-types";
import { pick } from "lodash";
import { useEffect, useState } from "react";

export default {
  Renderer(context, props: SfNumberInputRockConfig) {
    const { framework, page, scope } = context;
    const { value = "", disabled, color, fontSize, textDecorationLine, textDecorationStyle, textDecorationColor, onChange } = props;

    const wrapStyle: React.CSSProperties = pick(props, [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames]) as any;
    wrapStyle.position = "absolute";
    wrapStyle.display = "flex";
    wrapStyle.flexDirection = "column";
    wrapStyle.color = color;
    wrapStyle.fontSize = fontSize;
    wrapStyle.textDecorationLine = textDecorationLine;
    wrapStyle.textDecorationStyle = textDecorationStyle;
    wrapStyle.textDecorationColor = textDecorationColor;

    const [number, setNumber] = useState<string>(value);

    const onInputChange = (event: any) => {
      const value = event.target?.value;

      setNumber(value);
    };

    const onInputBlur = () => {
      const value = parseFloat(number || "0");

      if (isNaN(value)) {
        setNumber("0");
      } else {
        setNumber(`${value}`);
      }

      if (onChange) {
        handleComponentEvent("onChange", framework, page, scope, props, onChange, [number]);
      }
    };

    useEffect(() => {
      setNumber(value);
    }, [value]);

    return (
      <div data-component-id={props.$id} style={wrapStyle}>
        <input style={inputStyle} disabled={disabled} value={number} onChange={onInputChange} onBlur={onInputBlur} />
      </div>
    );
  },

  ...SfTextMeta,
} as Rock;

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};
