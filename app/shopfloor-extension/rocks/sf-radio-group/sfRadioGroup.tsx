import { CommonProps, handleComponentEvent, type Rock } from "@ruiapp/move-style";
import SfTextMeta from "./sfRadioGroupMeta";
import type { SfRadioGroupRockConfig } from "./sf-radio-group-types";
import { pick } from "lodash";
import { Radio, RadioChangeEvent, Space } from "antd";
import moment from "moment";

import "moment/locale/zh-cn";
moment.locale("zh-cn");

export default {
  Renderer(context, props: SfRadioGroupRockConfig) {
    const { framework, page, scope } = context;
    const { value, onChange, list = [], direction, fontSize } = props;

    console.log()

    const wrapStyle: React.CSSProperties = pick(props, [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames]) as any;
    wrapStyle.position = "absolute";
    wrapStyle.display = "flex";
    wrapStyle.flexDirection = "column";

    const onRadioChange = (e: RadioChangeEvent) => {
      const value = e.target.value;
      if (onChange) {
        handleComponentEvent("onChange", framework, page, scope, props, onChange, [value]);
      }
    };

    return (
      <div className="sf-date-select" data-component-id={props.$id} style={wrapStyle}>
        <Radio.Group onChange={onRadioChange} value={value}>
          <Space direction={direction}>
            {list.map((d) => {
              return (
                <Radio value={d.key} key={d.key} style={{ fontSize }}>
                  {d.value}
                </Radio>
              );
            })}
          </Space>
        </Radio.Group>
      </div>
    );
  },

  ...SfTextMeta,
} as Rock;
