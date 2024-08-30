import { CommonProps, handleComponentEvent, RockConfig, type Rock } from "@ruiapp/move-style";
import SfIconMeta from "./sfDropdownSelectMeta";
import type { SfIconRockConfig } from "./sf-dropdown-select-types";
import { pick } from "lodash";
import { renderRock } from "@ruiapp/react-renderer";
import { useState } from "react";

export default {
  Renderer(context, props: SfIconRockConfig) {
    const { framework, page, scope } = context;
    const { width, height, list = [], onChange, value } = props;

    const [selectKey,setSelectKey] = useState(value)

    const onSelectChange = (key: string) => {
      if (onChange) {
        setSelectKey(key)
        handleComponentEvent("onChange", framework, page, scope, props, onChange, [key]);
      }
    };

    const iconRockConfig: RockConfig = {
      $type: "antdSelect",
      options: list,
      value: selectKey,
      onChange: onSelectChange,
    };

    const wrapStyle: React.CSSProperties = pick(props, CommonProps.PositionStylePropNames) as any;
    wrapStyle.position = "absolute";
    wrapStyle.width = width;
    wrapStyle.height = height;
    
    return (
      <div className="sf-dropdown-select" data-component-id={props.$id} style={wrapStyle}>
        {renderRock({
          context,
          rockConfig: iconRockConfig,
        })}
      </div>
    );
  },

  ...SfIconMeta,
} as Rock;
