/* eslint-disable array-callback-return */
import { type Rock } from "@ruiapp/move-style";
import { useSetState } from "ahooks";
import { Table } from "antd";
import dayjs from "dayjs";
import { CSSProperties, useEffect, useState } from "react";
import rapidApi from "~/rapidApi";
import { sortedUniq } from "lodash";
import { AntdVirtualTable } from "@ruiapp/rapid-extension";

const DEFAULT_LIMIT = 20;

export default {
  $type: "inspectionFinishedStockList",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const [pageNum, setPageNum] = useState<number>(1);

    const { inspectionFeedStockData, dataSource, extraColumns, total, loading } = useInspectionFeedStockData();

    useEffect(() => {
      inspectionFeedStockData();
    }, []);

    const scrollStyle: CSSProperties = {
      overflow: "auto",
      height: "100%",
    };

    const columns = [
      {
        title: "生产批号",
        dataIndex: "lotNum",
        width: 160,
        fixed: "left",
        render: (_: any) => <div style={scrollStyle}>{_ || ""}</div>,
      },
      {
        title: "产品",
        dataIndex: "materialName",
        width: 160,
        fixed: "left",
        render: (_: any) => <div style={scrollStyle}>{_ || ""}</div>,
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
        render: (_: any) => <div style={scrollStyle}>{_ || ""}</div>,
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
        render: (_: any) => <div style={scrollStyle}>{_ || ""}</div>,
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
        width: 180,
        fixed: "left",
        render: (_: any) => <div style={scrollStyle}>{_ || ""}</div>,
      },
    ];

    const extraCol = extraColumns.map((item: any) => {
      return {
        title: item,
        dataIndex: item,
        width: 180,
        render: (_: any) => <div style={scrollStyle}>{_ || ""}</div>,
      };
    });

    const tableWidth = (extraCol || []).reduce((s, col) => col.width + s, 1000);
    const tableHeight = (dataSource?.length || 0) * 81;

    return (
      <div className="pm_inspection-input-sectioN">
        <div className="pm_inspection-title">成品检测数据列表：</div>
        <AntdVirtualTable
          loading={loading}
          scroll={{ x: tableWidth, y: tableHeight || 200 }}
          columns={columns.concat(extraCol) as any}
          dataSource={dataSource}
          rowHeight={80}
          pagination={{
            pageSize: DEFAULT_LIMIT,
            current: pageNum,
            total: total || 0,
            onChange(page, pageSize) {
              setPageNum(page);
              inspectionFeedStockData(page);
            },
          }}
        />
        {/* <Table scroll={{ x: tableWidth }} columns={columns.concat(extraCol)} dataSource={dataSource} /> */}
      </div>
    );
  },
} as Rock<any>;

interface InspectionFeedStockData {
  total: number;
  dataSource: any[];
  extraColumns: any[];
}

function useInspectionFeedStockData() {
  const [loading, setLoading] = useState<boolean>(false);
  const [state, setState] = useSetState<InspectionFeedStockData>({
    total: 0,
    dataSource: [],
    extraColumns: [],
  });

  const inspectionFeedStockData = async (page: number = 1) => {
    if (loading) {
      return;
    }

    setLoading(true);

    await rapidApi
      .post("/app/listMaterialInspections", {
        limit: DEFAULT_LIMIT,
        offset: (page - 1) * DEFAULT_LIMIT,
      })
      .then((res) => {
        const data = res.data?.items || [];
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
          total: res.data?.total || 0,
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
