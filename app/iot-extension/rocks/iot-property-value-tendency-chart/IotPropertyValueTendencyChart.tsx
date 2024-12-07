import type { Rock } from "@ruiapp/move-style";
import LinkMeta from "./IotPropertyValueTendencyChartMeta";
import type { IotPropertyValueTendencyChartRockConfig } from "./iot-property-value-tendency-chart-types";
import EChartsReact, { EChartsReactProps } from "echarts-for-react";
import { useRequest } from "ahooks";
import rapidApi from "~/rapidApi";
import { useMemo } from "react";

export type ListTelemetryValuesOfPropertyResult = {
  list: [number, any][];
};

export default {
  Renderer(context, props: IotPropertyValueTendencyChartRockConfig) {
    const { thingId, propertyCode, width, height, step, dataType } = props;

    const loadTelemetryValues = async () => {
      const res = await rapidApi.get(`svc/iot/property/telemetry?thingId=${thingId}&propertyCode=${encodeURIComponent(propertyCode || "")}&limit=100`, {});
      return res.data;
    };
    const { data, loading, error, refresh } = useRequest<ListTelemetryValuesOfPropertyResult, []>(loadTelemetryValues);

    const echartsProps: EChartsReactProps = useMemo(() => {
      const telemetryEntries = data?.list || [];
      return {
        option: {
          width,
          height,
          xAxis: {
            type: "time",
          },
          yAxis: {
            type: "value",
            minInterval: dataType === "boolean" ? 1 : undefined,
          },
          series: [
            {
              data: telemetryEntries,
              type: "line",
              step: step ? "end" : false,
            },
          ],
          tooltip: {
            trigger: "axis",
          },
        },
      };
    }, [width, height, step, dataType, data]);

    return <EChartsReact {...echartsProps} />;
  },

  ...LinkMeta,
} as Rock;
