/* eslint-disable array-callback-return */
import { type Rock } from "@ruiapp/move-style";
import { useSetState } from "ahooks";
import { Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import rapidApi from "~/rapidApi";
import { sortedUniq } from "lodash";
import { AntdVirtualTable, ClientOnlySuspense } from "@ruiapp/rapid-extension";

export default {
  $type: "inspectionFinishedStockList",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const { inspectionFeedStockData, dataSource, extraColumns } = useInspectionFeedStockData();

    useEffect(() => {
      inspectionFeedStockData();
    }, []);

    const columns = [
      {
        title: "生产批号",
        dataIndex: "lotNum",
        width: 160,
        fixed: "left",
        render: (_: any) => _ || "",
      },
      {
        title: "产品",
        dataIndex: "materialName",
        width: 160,
        fixed: "left",
        render: (_: any) => _ || "",
      },
      //   {
      //     title: "产品属性",
      //     dataIndex: "",
      //     width: 120,
      //     render: (_: any) => _ || "",
      //   },
      {
        title: "成品送样时间",
        dataIndex: "inspectionDate",
        width: 140,
        fixed: "left",
        render: (_: any) => dayjs(_).format("YYYY年MM月DD日") || "",
      },
      {
        title: "检测进度",
        dataIndex: "state",
        width: 120,
        fixed: "left",
        render: (_: any) => _ || "",
      },
      {
        title: "成品检测时间",
        dataIndex: "inspected_at",
        width: 140,
        fixed: "left",
        render: (_: any) => dayjs(_).format("YYYY年MM月DD日") || "",
      },
      {
        title: "判定",
        dataIndex: "result",
        width: 120,
        fixed: "left",
        render: (_: any) => _ || "",
      },
      //   {
      //     title: "异常项目描述",
      //     dataIndex: "",
      //     width: 120,
      //     render: (_: any) => _ || "",
      //   },
      {
        title: "备注",
        dataIndex: "remark",
        width: 120,
        fixed: "left",
        render: (_: any) => _ || "",
      },
    ];

    const extraCol = extraColumns.map((item: any) => {
      return {
        title: item,
        dataIndex: item,
        width: 120,
        render: (_: any) => _ || "",
      };
    });

    const tableWidth = (extraCol || []).reduce((s, col) => col.width + s, 1000);

    return (
      <div className="pm_inspection-input-sectioN">
        <div className="pm_inspection-title">成品检测数据列表：</div>
        <ClientOnlySuspense>
          <AntdVirtualTable scroll={{ x: tableWidth }} columns={columns.concat(extraCol) as any} dataSource={dataSource} />
        </ClientOnlySuspense>
        {/* <Table scroll={{ x: tableWidth }} columns={columns.concat(extraCol)} dataSource={dataSource} /> */}
      </div>
    );
  },
} as Rock<any>;

interface InspectionFeedStockData {
  dataSource: any[];
  extraColumns: any[];
}

function useInspectionFeedStockData() {
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useSetState<InspectionFeedStockData>({
    dataSource: [],
    extraColumns: [],
  });

  const inspectionFeedStockData = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    await rapidApi
      .post("/app/listMaterialInspections", {})
      .then((res) => {
        const data = res.data;
        let obj = {} as any;
        const measurements = sortedUniq(
          data
            .map((item: any) => item.measurements)
            .flat()
            .map((it: any) => it.name),
        );
        const result = data.map((item: any) => {
          item.measurements.map((it: any) => {
            obj[it.name] = it.value;
          });
          return {
            ...item,
            ...obj,
          };
        });
        setState({
          dataSource: result,
          extraColumns: measurements,
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  return { loading, inspectionFeedStockData, ...state };
}
