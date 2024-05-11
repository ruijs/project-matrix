import { CommonProps, type Rock } from "@ruiapp/move-style";
import SfSinglePickerMeta from "./SfSinglePickerMeta";
import type { SfSinglePickerRockConfig } from "./sf-single-picker-types";
import { get, pick } from "lodash";
import { Picker } from "antd-mobile";
import { useMemo, useState } from "react";

export default {
  Renderer(context, props: SfSinglePickerRockConfig) {
    const { value, onChange, dataSource, labelKey = "label", valueKey = "value" } = props;

    const [visible, setVisible] = useState<boolean>(false);
    const [selectedValue, setSelectedValue] = useState<string>("");

    const styleNames = [...CommonProps.PositionStylePropNames, ...CommonProps.SizeStylePropNames];
    const wrapStyle: React.CSSProperties = pick(props, styleNames) as any;
    wrapStyle.position = "absolute";

    const pickerColumns = useMemo(() => {
      if (!dataSource?.length) {
        return [];
      }

      return dataSource.map((item) => ({ label: get(item, labelKey), value: get(item, valueKey) }));
    }, [dataSource, labelKey, valueKey]);

    return (
      <>
        <div
          data-component-id={props.$id}
          style={wrapStyle}
          className="sf-single-picker"
          onClick={() => {
            setVisible(true);
          }}
        ></div>
        <Picker
          visible={visible}
          columns={[pickerColumns]}
          onClose={() => {
            setVisible(false);
          }}
          value={value ? [value] : []}
          onConfirm={(v) => {
            onChange?.(v?.[0] as string);
          }}
        />
      </>
    );
  },

  ...SfSinglePickerMeta,
} as Rock;
