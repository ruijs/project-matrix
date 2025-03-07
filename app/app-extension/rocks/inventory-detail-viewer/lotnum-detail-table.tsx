import { useSetState } from "ahooks";
import { Modal, Table, TableProps, Tag } from "antd";
import dayjs from "dayjs";
import { get } from "lodash";
import { memo, useEffect, useState } from "react";
import { rapidApiRequest } from "~/rapidApi";
import { useInspectionSpecItems } from "../view-inspection-record-action/ViewInspectionRecordAction";
import { renderCharacteristicQualifiedConditions } from "~/utils/inspection-utility";

interface IProps {
  record: any;
  show?: boolean;
}

const LotNumDetailTable = memo<IProps>((props) => {
  const [state, setState] = useSetState<{ visible?: boolean }>({});

  const { loadDetail, loading, detailItems } = useLotNumDetail();
  const { loadInspectionSpecItems, loading: inspectionSpecLoading, inspectionSpecItems } = useInspectionSpecItems();

  useEffect(() => {
    if (props.show && props.record?.material?.id) {
      loadDetail(props.record?.material?.id);
    }
  }, [props.record, props.show]);

  const tableColumns: TableProps<any>["columns"] = [
    {
      title: "批次",
      dataIndex: "lotNum",
      width: 120,
      fixed: "left",
    },
    {
      title: "数量",
      dataIndex: "onHandQuantity",
      width: 120,
    },
    {
      title: "入库日期",
      dataIndex: "createdAt",
      width: 120,
      render: (_, r) => r.lot?.createdAt && dayjs(r.lot?.createdAt).format("YYYY-MM-DD"),
    },
    {
      title: "失效日期",
      dataIndex: "validityDate",
      width: 120,
      render: (_, r) => r.lot?.validityDate && dayjs(r.lot?.validityDate).format("YYYY-MM-DD"),
    },
    {
      dataIndex: "id",
      width: 100,
      render: (_, r) => {
        return (
          <a
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();

              setState({ visible: true });
              loadInspectionSpecItems({ materialId: props.record?.material?.id, lotNum: r.lotNum });
            }}
          >
            查看指标
          </a>
        );
      },
    },
  ];

  return (
    <>
      <Table rowKey="id" loading={loading} columns={tableColumns} dataSource={detailItems} size="middle" scroll={{ x: 580 }} pagination={false} />
      <Modal
        title="检验指标"
        footer={false}
        open={state.visible}
        bodyStyle={{ padding: 8 }}
        onCancel={() => {
          setState({ visible: false });
        }}
      >
        <Table
          loading={inspectionSpecLoading}
          pagination={false}
          rowKey="id"
          size="small"
          dataSource={inspectionSpecItems}
          columns={[
            {
              title: "指标名称",
              dataIndex: "characteristic",
              width: 180,
              render: (c: any, r: any) => {
                return get(r, "characteristic.name");
              },
            },
            {
              title: "标准值",
              dataIndex: "normal",
              width: 120,
              render: (_: any, r: any) => {
                return renderCharacteristicQualifiedConditions(r.characteristic);
              },
            },
            {
              title: "实测值",
              dataIndex: "value",
              width: 120,
              render: (_: any, r: any) => {
                switch (r.characteristic?.kind) {
                  case "qualitative":
                    return <Tag color={r.isQualified ? "success" : "error"}>{get(r, "qualitativeValue")}</Tag>;
                  case "quantitative":
                    return <Tag color={r.isQualified ? "success" : "error"}>{get(r, "quantitativeValue")}</Tag>;
                }
              },
            },
          ]}
        />
      </Modal>
    </>
  );
});

export default LotNumDetailTable;

function useLotNumDetail() {
  const [loading, setLoading] = useState<boolean>(false);
  const [detailItems, setDetailItems] = useState<any[]>([]);

  const loadDetail = async (materialId: string) => {
    if (loading) {
      return;
    }

    setLoading(true);
    const { result, error } = await rapidApiRequest({
      url: "/mom/mom_material_lot_inventory_balances/operations/find",
      method: "post",
      data: {
        filters: [
          {
            field: "material",
            operator: "exists",
            filters: [
              {
                field: "id",
                operator: "eq",
                value: materialId,
              },
            ],
          },
        ],
        pagination: { limit: 1000, offset: 0 },
        properties: ["id", "material", "lot", "lotNum", "onHandQuantity", "warehouse", "unit", "validityDate"],
      },
    });

    if (!error) {
      setDetailItems(result?.list || []);
    }
    setLoading(false);
  };

  return { loadDetail, loading, detailItems };
}
