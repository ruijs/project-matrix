import type { Rock } from "@ruiapp/move-style";
import PagePrint from "./PagePrintMeta";
import { lazy, useEffect, useState, Suspense, useMemo } from "react";
import rapidApi from "~/rapidApi";
import { Descriptions, Divider, Space, Table, Tag } from "antd";
import { find, forEach, get, isEmpty, trim } from "lodash";
import { parseRockExpressionFunc } from "@ruiapp/rapid-extension";
import { decimalSum } from "~/utils/decimal";
import rapidAppDefinition from "~/rapidAppDefinition";
import dayjs from "dayjs";
import { renderInventoryManagerDisplayLabel } from "~/app-extension/utils/inventory-manager-utility";

const PrintTemplate = lazy(() => import("./PrintOrderTemplate"));
export default {
  Renderer(context, props) {
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const detail = context.page.getStore("detail").data?.list?.[0];
    const cols = props?.columns;
    const { getDataSource, dataSource } = useLodaData();

    useEffect(() => {
      setIsMounted(true);
      if (detail) {
        getDataSource(props);
      }
    }, [detail]);

    const dataSourceGroupBy = useMemo(() => {
      const groupMap = new Map();
      forEach(dataSource, (item) => {
        const uniqeKey = `${item.material.id}_${item.lotNum}`;
        const group = groupMap.get(uniqeKey);
        if (!group) {
          groupMap.set(uniqeKey, { ...item, binNumItems: [item] });
        } else {
          const binNumItems = group.binNumItems;
          groupMap.set(uniqeKey, { ...item, quantity: decimalSum(group.quantity || 0, item.quantity || 0), binNumItems: [...binNumItems, item] });
        }
      });

      return [...groupMap.values()];
    }, [dataSource]);

    if (!isMounted) {
      return <></>;
    }

    const formateCol = () => {
      const res = cols.map((item: any) => {
        return {
          title: item.name,
          dataIndex: item.code,
          align: "center",
          render: (_: any, record: any) => {
            if (typeof item.columnRenderAdapter === "string" && trim(item.columnRenderAdapter)) {
              const adapter = parseRockExpressionFunc(item.columnRenderAdapter, { record }, context);
              const labels = adapter();
              return (
                <Space wrap direction="vertical">
                  {labels?.map((label: any, i: number) => (
                    <Tag key={i}>{label}</Tag>
                  ))}
                </Space>
              );
            }

            return item.isObject
              ? item.jointValue
                ? `${record[item.code]?.[item.value]}-${record[item.code]?.[item.jointValue]}(${record[item.code]?.[item?.joinAnOtherValue]})` || "-"
                : record[item.code]?.[item.value] || "-"
              : _ || "-";
          },
        };
      });
      return res;
    };

    const operationTypeDictionary = find(rapidAppDefinition.dataDictionaries, (d) => d.code === "MomInventoryOperationType");
    const operationType = find(operationTypeDictionary?.entries, (e) => e.value === get(detail, "operationType"));

    const printContent = (
      <div>
        <div className="print-content-title">
          {detail?.businessType?.name}单:{detail?.code}
        </div>
        <Descriptions title="基础信息" column={3}>
          <Descriptions.Item label="申请单号">{get(detail, "code")}</Descriptions.Item>
          <Descriptions.Item label="库存操作类型">{get(operationType, "name") && <Tag>{get(operationType, "name")}</Tag>}</Descriptions.Item>
          <Descriptions.Item label="业务类型">{get(detail, "businessType.name")}</Descriptions.Item>
          {["in", "out"].includes(get(detail, "operationType")) && (
            <>
              <Descriptions.Item label="申请人">{get(detail, "applicant.name")}</Descriptions.Item>
              {get(detail, "businessType").name !== "入库调整单" && get(detail, "businessType").name !== "出库调整单" && (
                <>
                  <Descriptions.Item label={renderInventoryManagerDisplayLabel(get(detail, "businessType.name"), "fFManager")}>
                    {get(detail, "fFManager.name")}
                  </Descriptions.Item>
                  <Descriptions.Item label={renderInventoryManagerDisplayLabel(get(detail, "businessType.name"), "fSManager")}>
                    {get(detail, "fSManager.name")}
                  </Descriptions.Item>
                </>
              )}

              {[
                "其它原因出库",
                "其它原因出库退货入库",
                "领料出库",
                "生产退料入库",
                "其它原因入库",
                "采购入库",
                "采购退货出库",
                "生产入库",
                "生产入库退货出库",
              ].includes(get(detail, "businessType.name")) && (
                <Descriptions.Item
                  label={
                    ["其它原因出库", "其它原因出库退货入库", "领料出库", "生产退料入库"].includes(get(detail, "businessType.name"))
                      ? "领料部门"
                      : ["其它原因入库", "采购入库", "采购退货出库"].includes(get(detail, "businessType.name"))
                      ? "部门"
                      : ["生产入库", "生产入库退货出库"].includes(get(detail, "businessType.name"))
                      ? "交货部门"
                      : "部门"
                  }
                >
                  {get(detail, "department.name")}
                </Descriptions.Item>
              )}

              {["委外加工出库", "委外加工出库退货入库", "委外加工入库"].includes(get(detail, "businessType.name")) && (
                <Descriptions.Item label="加工单位">{get(detail, "supplier.name")}</Descriptions.Item>
              )}

              {["委外加工出库", "委外加工出库退货入库", "其它原因出库", "其它原因出库退货入库", "领料出库", "生产退料入库"].includes(
                get(detail, "businessType.name"),
              ) && (
                <Descriptions.Item label={get(detail, "businessType.name") === "委外加工出库" ? "加工要求" : "领料用途"}>
                  {get(detail, "fUse")}
                </Descriptions.Item>
              )}

              {get(detail, "operationType") === "out" && get(detail, "businessType").name !== "生产入库退货出库" && (
                <>
                  <Descriptions.Item label="生产计划单编号">{get(detail, "fPlanSn")}</Descriptions.Item>
                </>
              )}
              {get(detail, "operationType") === "out" && get(detail, "businessType.config.defaultSourceType") === "sales" && (
                <Descriptions.Item label="客户">{get(detail, "customer.name")}</Descriptions.Item>
              )}
              <Descriptions.Item label="仓库">{get(detail, "operationType") === "in" ? get(detail, "to.name") : get(detail, "from.name")}</Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="创建时间">{get(detail, "createdAt") && dayjs(get(detail, "createdAt")).format("YYYY-MM-DD HH:mm:ss")}</Descriptions.Item>
        </Descriptions>
        <Table className="antd-style" bordered columns={formateCol() || []} dataSource={dataSourceGroupBy} pagination={false} />
      </div>
    );

    return (
      <Suspense fallback={<div>Loading</div>}>
        <PrintTemplate printContent={printContent} />
      </Suspense>
    );
  },

  ...PagePrint,
} as Rock<any>;

const useLodaData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<any>([]);

  const getDataSource = (props: any) => {
    if (loading) {
      return;
    }
    try {
      const apiUrl = props?.apiUrl;
      rapidApi
        .post(`${apiUrl}`, {
          orderBy: props?.orderBy,
          filters: props?.filters,
          properties: props?.properties,
          relations: props.relations,
        })
        .then((res) => {
          setDataSource(res.data.list);
        });
    } finally {
      setLoading(false);
    }
  };

  return { loading, getDataSource, dataSource };
};
