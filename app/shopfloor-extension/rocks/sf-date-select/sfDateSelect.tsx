import { CommonProps, handleComponentEvent, type Rock } from "@ruiapp/move-style";
import SfTextMeta from "./sfDateSelectMeta";
import type { SfDateSelectRockConfig } from "./sf-date-select-types";
import { pick } from "lodash";
import { ConfigProvider, DatePicker, DatePickerProps } from "antd";
import zhCN from 'antd/lib/locale/zh_CN';
import moment from "moment";

import "moment/locale/zh-cn";
moment.locale("zh-cn");

export default {
  Renderer(context, props: SfDateSelectRockConfig) {
    const { framework, page, scope } = context;
    const { value, onChange } = props;

    const wrapStyle: React.CSSProperties = pick(props, [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames]) as any;
    wrapStyle.position = "absolute";
    wrapStyle.display = "flex";
    wrapStyle.flexDirection = "column";

    const onDateChange: DatePickerProps["onChange"] = (date, dateString) => {
      if (onChange) {
        handleComponentEvent("onChange", framework, page, scope, props, onChange, [dateString]);
      }
    };

    return (
      <div className="sf-date-select" data-component-id={props.$id} style={wrapStyle} >
        <ConfigProvider locale={zhCN}>
          <DatePicker size="large" value={moment(value)} onChange={onDateChange} popupClassName="sf-date-select-popup"></DatePicker>
        </ConfigProvider>
      </div>
    );
  },

  ...SfTextMeta,
} as Rock;
