/* eslint-disable array-callback-return */
import { type Rock } from "@ruiapp/move-style";
import { useDebounce, useSetState } from "ahooks";
import { Input, Pagination, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import rapidApi from "~/rapidApi";
import { sortedUniq } from "lodash";
import { AntdVirtualTable } from "@ruiapp/rapid-extension";

const DEFAULT_LIMIT = 20;

export default {
  $type: "inspectionFeedStockList",

  slots: {},

  propertyPanels: [],

  Renderer(context, props, state) {
    const [pageNum, setPageNum] = useState<number>(1);
    const { Search } = Input;
    const { inspectionFeedStockData, dataSource, extraColumns, total, loading } = useInspectionFeedStockData();
    const [keyword, setKeyword] = useState<string>("");

    const debouncedKeyword = useDebounce(keyword, { wait: 500 });

    useEffect(() => {
      inspectionFeedStockData(1, debouncedKeyword);
    }, [debouncedKeyword]);

    const columns = [
      {
        title: "生产批号",
        dataIndex: "lotNum",
        width: 160,
        clasName: "pm_inspection-lotNum",
        fixed: "left",
        render: (_: any) => <div style={{ padding: "8px 0" }}>{_ || ""}</div>,
      },
      {
        title: "产品",
        dataIndex: "materialName",
        clasName: "pm_inspection-lotNum",
        width: 160,
        fixed: "left",
        render: (_: any) => <div style={{ padding: "8px 0" }}>{_ || ""}</div>,
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
        clasName: "pm_inspection-lotNum",
        width: 140,
        fixed: "left",
        render: (_: any) => <div style={{ padding: "8px 0" }}>{dayjs(_).format("YYYY年MM月DD日") || ""}</div>,
      },
      {
        title: "检测进度",
        dataIndex: "state",
        clasName: "pm_inspection-lotNum",
        width: 120,
        fixed: "left",
        render: (_: any) => <div style={{ padding: "8px 0" }}>{_ || ""}</div>,
      },
      {
        title: "成品检测时间",
        dataIndex: "inspected_at",
        clasName: "pm_inspection-lotNum",
        width: 140,
        fixed: "left",
        render: (_: any) => <div style={{ padding: "8px 0" }}>{dayjs(_).format("YYYY年MM月DD日") || ""}</div>,
      },
      {
        title: "判定",
        dataIndex: "result",
        clasName: "pm_inspection-lotNum",
        width: 120,
        fixed: "left",
        render: (_: any) => <div style={{ padding: "8px 0" }}>{_ || ""}</div>,
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
        render: (_: any) => <div style={{ padding: "8px 0" }}>{_ || ""}</div>,
      },
    ];

    const extraCol = extraColumns.map((item: any) => {
      return {
        title: item,
        dataIndex: item,
        width: 180,
        render: (_: any) => <div style={{ padding: "8px 0" }}>{_ || ""}</div>,
      };
    });

    const tableWidth = (extraCol || []).reduce((s, col) => col.width + s, 1000);
    // const tableHeight = (dataSource?.length || 0) * 81;

    const onSearch = (value: string) => {
      setKeyword(value);
    };

    return (
      <div className="pm_inspection-input-sectioN">
        <div className="pm_inspection-title">
          <div>进料检测数据列表：</div>
          <div>
            <Search placeholder="请输入规格、名称、编号" allowClear enterButton size="middle" onSearch={onSearch} />
          </div>
        </div>
        <Table
          loading={loading}
          scroll={{
            x: tableWidth,
            y: 850,
            // scrollToFirstRowOnChange: true,
          }}
          columns={columns.concat(extraCol as any) as any}
          dataSource={dataSource}
          pagination={false}
        />

        {/* <AntdVirtualTable
          loading={loading}
          scroll={{
            x: tableWidth,
            y: 850,
            // scrollToFirstRowOnChange: true,
          }}
          columns={columns.concat(extraCol as any) as any}
          dataSource={dataSource}
          rowHeight={80}
          pagination={false}
        /> */}
        {/* <div style={{ height: 850, overflow: "auto", zIndex: 10 }}>
         
        </div> */}
        <div style={{ height: 50, marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <Pagination
            current={pageNum}
            pageSize={DEFAULT_LIMIT}
            showSizeChanger={false}
            total={total || 0}
            onChange={(page, pageSize) => {
              setPageNum(page);
              inspectionFeedStockData(page, debouncedKeyword);
            }}
          />
        </div>
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

  function convertArrayToString(arr: any) {
    // 检查数组是否至少有两个元素
    if (arr.length < 2) {
      return arr[0];
    }

    // 获取数组的第一个元素
    const firstElement = arr[0];
    // 获取数组中剩余的所有元素，并转换为字符串
    const remainingElements = arr.slice(1).join("，");

    // 返回格式化的字符串
    return `${firstElement}(${remainingElements})`;
  }

  const inspectionFeedStockData = async (page: number = 1, debouncedKeyword: string) => {
    if (loading) {
      return;
    }

    setLoading(true);

    await rapidApi
      .post("/app/listRawMaterialInspections", {
        keyword: debouncedKeyword,
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
            const res = it.value.split(",").map((item: any) => item.split("-")[1] || "-");
            obj[it.name] = convertArrayToString(res);
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
