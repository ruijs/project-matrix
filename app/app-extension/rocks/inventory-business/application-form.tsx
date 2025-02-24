/* eslint-disable react/display-name */
import { useNavigate } from "@remix-run/react";
import type { RockEvent, RockInstanceContext, type Rock } from "@ruiapp/move-style";
import { useDebounceFn, useSetState } from "ahooks";
import { Button, Form, Input, InputNumber, message, Select, Space, Table } from "antd";
import { memo, useEffect, useMemo, useState } from "react";
import rapidApi, { rapidApiRequest } from "~/rapidApi";
import { PlusOutlined } from "@ant-design/icons";
import { renderRock } from "@ruiapp/react-renderer";
import { forEach, isEmpty, last, pick } from "lodash";
import dayjs from "dayjs";
import { materialFormatStrTemplate } from "~/utils/fmt";
import type { ColumnProps } from "antd/lib/table";
import { decimalSum } from "~/utils/decimal";
import SaleLotNumSelect from "./saleLotNumSelect";
import { renderInventoryManagerDisplayLabel } from "~/app-extension/utils/inventory-manager-utility";

const LotSelect = memo<{
  isSalesOut: boolean;
  operationType: string;
  businessType: string;
  businessTypeName: string | undefined;
  customerId: string;
  warehouseId?: string;
  record: Record<string, any>;
  recordIndex: number;
  context: RockInstanceContext;
  onChange(v: string): void;
}>((props) => {
  const { isSalesOut, operationType, businessType, businessTypeName, customerId, warehouseId, record: r, recordIndex: i, context } = props;

  const { loading, inspectionRule } = useInspectionRule({ customerId, materialId: r.material?.id });

  if (businessTypeName === "生产退料入库") {
    return (
      <SaleLotNumSelect
        value={r.lotNum}
        materialId={r.material?.id}
        onChange={(val: string) => {
          props.onChange(val);
        }}
      />
    );
  }

  if (isSalesOut && customerId && inspectionRule) {
    return (
      <CustomerLotSelect
        loading={loading}
        warehouseId={warehouseId}
        materialId={r.material?.id}
        customerId={customerId}
        inspectRuleId={inspectionRule?.id}
        value={r.lotNum}
        onChange={(val: string) => {
          props.onChange(val);
        }}
      />
    );
  }

  if (operationType === "out" || operationType === "transfer") {
    return renderRock({
      context,
      rockConfig: {
        $id: i + "_lotnum",
        $type: "materialLotNumSelector",
        materialId: r.material?.id,
        warehouseId: warehouseId,
        customerId: customerId,
        materialCategoryId: r.material?.category?.id,
        businessTypeId: businessType,
        value: r.lotNum,
        onChange: [
          {
            $action: "script",
            script: (e: RockEvent) => {
              const val = e.args?.[0];
              props.onChange(val);
            },
          },
        ],
      },
    });
  }

  return (
    <Input
      placeholder="请输入"
      value={r.lotNum}
      onChange={(e) => {
        const val = e.target.value;
        props.onChange(val);
      }}
    />
  );
});

export default {
  $type: "inventoryApplicationForm",

  slots: {},

  propertyPanels: [],

  Renderer(context, props) {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [refreshKey, setRefreshKey] = useState<string | number>();
    const [isSalesOut, setIsSalesOut] = useState<boolean>(false);
    const [operationType, setOperationType] = useState<string>();
    const [businessType, setBusinessType] = useState<string>();
    const [materialItems, setMaterialItems] = useState<any[]>([]);
    const [enabledBinNum, setEnabledBinNum] = useState<boolean>(false);
    const [warehouseId, setWarehouseId] = useState<string>();

    const { saveApplication, saving } = useSaveApplication((data) => {
      navigate(`/pages/mom_inventory_application_details?id=${data.id}`);
    });

    let binNumColumn: ColumnProps<any> = {
      title: "托盘号",
      dataIndex: "binNum",
      width: 120,
      render: (_, r, i) => {
        let fixedFilters: any[] = [
          {
            field: "quantity",
            operator: "gt",
            value: 0,
          },
          {
            field: "state",
            operator: "eq",
            value: "normal",
          },
        ];
        if (r.material?.id) {
          fixedFilters.push({
            field: "material",
            operator: "exists",
            filters: [
              {
                field: "id",
                operator: "eq",
                value: r.material?.id,
              },
            ],
          });
        }
        if (r.lotNum) {
          fixedFilters.push({
            field: "lotNum",
            operator: "eq",
            value: r.lotNum,
          });
        }
        if (warehouseId) {
          fixedFilters.push({
            field: "warehouse_id",
            operator: "eq",
            value: warehouseId,
          });
        }

        return renderRock({
          context,
          rockConfig: {
            $type: "rapidTableSelect",
            $id: `${i}_${warehouseId}_${r.material?.id}_${r.lotNum}_binNum`,
            placeholder: "请选择",
            dropdownMatchSelectWidth: 500,
            mode: "multiple",
            listValueFieldName: "binNum",
            listTextFormat: "{{binNum}}",
            listFilterFields: ["binNum"],
            searchPlaceholder: "托盘号搜索",
            columns: [
              { title: "托盘号", code: "binNum" },
              { title: "在库数量", code: "quantity", width: 80 },
              { title: "库位", code: "location.name", width: 100 },
            ],
            requestConfig: {
              url: "/mom/mom_goods/operations/find",
              method: "post",
              params: {
                properties: ["id", "material", "good", "binNum", "lotNum", "lot", "quantity", "location"],
                fixedFilters,
                orderBy: [
                  {
                    field: "location.code",
                  },
                ],
              },
            },
            value: (r.binNum || []).map((item: any) => item.binNum),
            onSelectedRecord: [
              {
                $action: "script",
                script: (e: RockEvent) => {
                  const records: any[] = e.args[1];
                  setMaterialItems((draft) => {
                    const binNumQuantity = (records || []).reduce((s, r) => decimalSum(s, r.quantity || 0), 0);
                    return draft.map((item, index) =>
                      i === index
                        ? {
                            ...item,
                            binNum: records,
                            quantity: binNumQuantity,
                          }
                        : item,
                    );
                  });
                },
              },
            ],
          },
        });
      },
    };

    const renderLable = (businessTypeName: string, name: string) => {
      return renderInventoryManagerDisplayLabel(businessTypeName, name);
    };

    const renderMessage = (businessTypeName: string, name: string) => {
      switch (businessTypeName) {
        case "销售出库":
          return name === "fFManager" ? "发货人必填" : "保管人必填";
        case "生产入库退货出库":
          return name === "fFManager" ? "验收人必填" : "保管人必填";
        default:
          return name === "fFManager" ? "发料人必填" : "领料人必填";
      }
    };

    return (
      <div style={{ padding: "24px 0 0" }}>
        <Form
          form={form}
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 5 }}
          onFinish={({ warehouse, ...restValues }) => {
            let applicationItems: any[] = [];
            forEach(materialItems, (item) => {
              if (isEmpty(item.binNum)) {
                applicationItems.push({
                  material: item.material?.id,
                  unit: item.unit?.id,
                  lotNum: item.lotNum,
                  quantity: item.quantity,
                  remark: item.remark,
                });
              } else {
                forEach(item.binNum, (binNumItem) => {
                  applicationItems.push({
                    material: item.material?.id,
                    unit: item.unit?.id,
                    lotNum: item.lotNum,
                    remark: item.remark,
                    quantity: binNumItem.quantity,
                    good: binNumItem.id,
                    binNum: binNumItem.binNum,
                  });
                });
              }
            });

            let warehouseInfo: Record<string, any> = {
              to: warehouse,
            };
            if (restValues.operationType === "out") {
              warehouseInfo = {
                from: warehouse,
              };
            }

            saveApplication({
              operationState: "pending",
              operationType: "in",
              state: "approved",
              source: "manual",
              ...restValues,
              ...warehouseInfo,
              items: applicationItems,
            });
          }}
          onValuesChange={(values) => {
            setRefreshKey(dayjs().unix());

            if (values.hasOwnProperty("warehouse")) {
              setWarehouseId(values.warehouse);
              setMaterialItems([]);
            }
          }}
        >
          <Form.Item required label="业务类型" name="businessType" rules={[{ required: true, message: "业务类型必填" }]}>
            {renderRock({
              context,
              rockConfig: {
                $type: "rapidTableSelect",
                $id: `${props.$id}_businessType`,
                placeholder: "请选择",
                columns: [{ title: "名称", code: "name" }],
                requestConfig: {
                  url: "/mom/mom_inventory_business_types/operations/find",
                  method: "post",
                  params: {
                    fixedFilters: [
                      {
                        field: "operationType",
                        operator: "in",
                        value: ["in", "out"],
                        itemType: "text",
                      },
                      {
                        field: "name",
                        operator: "notIn",
                        value: ["入库调整单", "出库调整单"],
                        itemType: "text",
                      },
                    ],
                  },
                },
                onSelectedRecord: [
                  {
                    $action: "script",
                    script: (e: RockEvent) => {
                      const record: any = e.args[0];

                      const isSalesOut = record?.operationType === "out" && record?.config?.defaultSourceType === "sales";

                      setBusinessType(record?.name);
                      setOperationType(record?.operationType);
                      setEnabledBinNum(record?.operationType === "out");
                      setIsSalesOut(isSalesOut);
                      if (!isSalesOut) {
                        form.setFieldValue("customer", null);
                      }
                      // 切换业务类型，如果为非出库操作，需要清空托盘号信息
                      if (record?.operationType !== "out") {
                        setMaterialItems(materialItems?.map(({ binNum, ...restItem }) => restItem));
                      }
                      form.setFieldValue("operationType", record?.operationType);
                      form.setFieldValue("fFManager", undefined);
                      form.setFieldValue("fSManager", undefined);
                    },
                  },
                ],
              },
            })}
          </Form.Item>
          <Form.Item hidden name="operationType" />
          <Form.Item label="申请人" name="applicant" rules={[{ required: true, message: "申请人必填" }]}>
            {renderRock({
              context,
              rockConfig: {
                $type: "rapidTableSelect",
                $id: `${props.$id}_applicant`,
                placeholder: "请选择",
                listFilterFields: ["name"],
                searchPlaceholder: "名称搜索",
                columns: [{ title: "名称", code: "name" }],
                requestConfig: {
                  url: "/app/oc_users/operations/find",
                  method: "post",
                  params: { orderBy: [{ field: "name" }] },
                },
              },
            })}
          </Form.Item>
          {operationType === "in" && businessType !== "生产退料入库" && (
            <>
              <Form.Item label="验收" name="fFManager" rules={[{ required: true, message: "验收人必填" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "rapidTableSelect",
                    $id: `${props.$id}_ff_manager`,
                    placeholder: "请选择",
                    listFilterFields: ["name"],
                    searchPlaceholder: "名称搜索",
                    columns: [{ title: "名称", code: "name" }],
                    requestConfig: {
                      url: "/app/oc_users/operations/find",
                      method: "post",
                      params: { orderBy: [{ field: "name" }] },
                    },
                  },
                })}
              </Form.Item>
              <Form.Item label="保管" name="fSManager" rules={[{ required: true, message: "保管人必填" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "rapidTableSelect",
                    $id: `${props.$id}_fs_manager`,
                    placeholder: "请选择",
                    listFilterFields: ["name"],
                    searchPlaceholder: "名称搜索",
                    columns: [{ title: "名称", code: "name" }],
                    requestConfig: {
                      url: "/app/oc_users/operations/find",
                      method: "post",
                      params: { orderBy: [{ field: "name" }] },
                    },
                  },
                })}
              </Form.Item>
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
          ].includes(businessType || "") && (
            <Form.Item
              label={
                ["其它原因出库", "其它原因出库退货入库", "领料出库", "生产退料入库"].includes(businessType || "")
                  ? "领料部门"
                  : ["其它原因入库", "采购入库", "采购退货出库"].includes(businessType || "")
                  ? "部门"
                  : ["生产入库", "生产入库退货出库"].includes(businessType || "")
                  ? "交货部门"
                  : "部门"
              }
              name="department"
            >
              {renderRock({
                context,
                rockConfig: {
                  $type: "rapidTableSelect",
                  $id: `${props.$id}_department`,
                  placeholder: "请选择",
                  listFilterFields: ["name"],
                  searchPlaceholder: "名称搜索",
                  columns: [{ title: "名称", code: "name" }],
                  requestConfig: {
                    url: "/app/oc_departments/operations/find",
                    method: "post",
                    params: { orderBy: [{ field: "name" }] },
                  },
                },
              })}
            </Form.Item>
          )}
          {(operationType === "out" || businessType === "生产退料入库") && (
            <>
              <Form.Item
                label={renderLable(businessType || "", "fFManager")}
                name="fFManager"
                rules={[{ required: true, message: renderMessage(businessType || "", "fFManager") }]}
              >
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "rapidTableSelect",
                    $id: `${props.$id}_ff_manager`,
                    placeholder: "请选择",
                    listFilterFields: ["name"],
                    searchPlaceholder: "名称搜索",
                    columns: [{ title: "名称", code: "name" }],
                    requestConfig: {
                      url: "/app/oc_users/operations/find",
                      method: "post",
                      params: { orderBy: [{ field: "name" }] },
                    },
                  },
                })}
              </Form.Item>
              <Form.Item
                label={renderLable(businessType || "", "fSManager")}
                name="fSManager"
                rules={[{ required: true, message: renderMessage(businessType || "", "fSManager") }]}
              >
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "rapidTableSelect",
                    $id: `${props.$id}_fs_manager`,
                    placeholder: "请选择",
                    listFilterFields: ["name"],
                    searchPlaceholder: "名称搜索",
                    columns: [{ title: "名称", code: "name" }],
                    requestConfig: {
                      url: "/app/oc_users/operations/find",
                      method: "post",
                      params: { orderBy: [{ field: "name" }] },
                    },
                  },
                })}
              </Form.Item>
            </>
          )}
          {(businessType === "领料出库" || businessType === "生产退料入库") && (
            <>
              <Form.Item label="生产计划单号" name="fPlanSn" rules={[{ message: "生产计划单号" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "antdInput",
                    $id: `${props.$id}_f_plan_sn`,
                    placeholder: "请输入",
                  },
                })}
              </Form.Item>
            </>
          )}
          {businessType === "销售出库" && (
            <>
              <Form.Item label="合同单号" name="contractNum" rules={[{ message: "合同单号" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "antdInput",
                    $id: `${props.$id}_f_plan_sn`,
                    placeholder: "请输入",
                  },
                })}
              </Form.Item>
            </>
          )}
          {businessType === "销售出库" && (
            <>
              <Form.Item label="物流公司" name="express" rules={[{ message: "物流公司" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "rapidTableSelect",
                    $id: `${props.$id}_express`,
                    placeholder: "请选择",
                    listFilterFields: ["name", "code"],
                    searchPlaceholder: "名称、编号搜索",
                    columns: [
                      { title: "名称", code: "name" },
                      { title: "编号", code: "code" },
                    ],
                    requestConfig: {
                      url: "/app/base_partners/operations/find",
                      method: "post",
                      params: {
                        fixedFilters: [
                          {
                            field: "categories",
                            operator: "exists",
                            filters: [{ field: "code", operator: "eq", value: "express_supplier" }],
                          },
                        ],
                        orderBy: [{ field: "name" }],
                      },
                    },
                  },
                })}
              </Form.Item>
              <Form.Item label="销售发货单号" name="fDeliveryCode" rules={[{ message: "销售发货单号" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "antdInput",
                    $id: `${props.$id}_f_delivery_code`,
                    placeholder: "请输入",
                  },
                })}
              </Form.Item>
            </>
          )}
          <Form.Item label="仓库" name="warehouse" rules={[{ required: true, message: "仓库必填" }]}>
            {renderRock({
              context,
              rockConfig: {
                $type: "rapidTableSelect",
                $id: `${props.$id}_warehouse`,
                placeholder: "请选择",
                listFilterFields: ["name", "code"],
                searchPlaceholder: "名称、编号搜索",
                columns: [
                  { title: "名称", code: "name" },
                  { title: "编号", code: "code" },
                ],
                requestConfig: {
                  url: "/app/base_locations/operations/find",
                  method: "post",
                  params: {
                    fixedFilters: [
                      {
                        field: "type",
                        operator: "eq",
                        value: "warehouse",
                      },
                    ],
                    orderBy: [{ field: "name" }],
                  },
                },
              },
            })}
          </Form.Item>
          <Form.Item label="客户" name="customer" hidden={!isSalesOut}>
            {renderRock({
              context,
              rockConfig: {
                $type: "rapidTableSelect",
                $id: `${props.$id}_customer`,
                placeholder: "请选择",
                listFilterFields: ["name"],
                searchPlaceholder: "名称搜索",
                columns: [{ title: "名称", code: "name" }],
                requestConfig: {
                  url: "/app/base_partners/operations/find",
                  method: "post",
                  params: {
                    orderBy: [{ field: "name" }],
                    fixedFilters: [
                      {
                        field: "categories",
                        operator: "exists",
                        filters: [{ field: "code", operator: "eq", value: "customer" }],
                      },
                    ],
                    properties: ["id", "name", "categories"],
                  },
                },
              },
            })}
          </Form.Item>
          {["委外加工出库", "委外加工出库退货入库", "委外加工入库"].includes(businessType || "") && (
            <Form.Item label="加工单位" name="supplier">
              {renderRock({
                context,
                rockConfig: {
                  $type: "rapidTableSelect",
                  $id: `${props.$id}_supplier`,
                  placeholder: "请选择",
                  listFilterFields: ["name"],
                  searchPlaceholder: "名称搜索",
                  columns: [{ title: "名称", code: "name" }],
                  requestConfig: {
                    url: "/app/base_partners/operations/find",
                    method: "post",
                    params: {
                      orderBy: [{ field: "name" }],
                    },
                  },
                },
              })}
            </Form.Item>
          )}
          {["领料出库", "生产退料入库", "委外加工出库", "委外加工出库退货入库", "其它原因出库"].includes(businessType || "") && (
            <Form.Item
              label={["委外加工出库", "委外加工出库退货入库"].includes(businessType || "") ? "加工要求" : "领料用途"}
              name="fUse"
              required={true}
              rules={[{ required: true, message: ["委外加工出库", "委外加工出库退货入库"].includes(businessType || "") ? "加工要求必填" : "领料用途必填" }]}
            >
              {renderRock({
                context,
                rockConfig: {
                  $type: "antdInput",
                  $id: `${props.$id}_f_use`,
                  placeholder: "请输入",
                },
              })}
            </Form.Item>
          )}
          {businessType === "销售出库" && (
            <>
              <Form.Item label="合同单号" name="contractNum" rules={[{ message: "合同单号" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "antdInput",
                    $id: `${props.$id}_f_plan_sn`,
                    placeholder: "请输入",
                  },
                })}
              </Form.Item>
            </>
          )}
          {businessType === "销售出库" && (
            <>
              <Form.Item label="物流公司" name="express" rules={[{ message: "物流公司" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "rapidTableSelect",
                    $id: `${props.$id}_express`,
                    placeholder: "请选择",
                    listFilterFields: ["name", "code"],
                    searchPlaceholder: "名称、编号搜索",
                    columns: [
                      { title: "名称", code: "name" },
                      { title: "编号", code: "code" },
                    ],
                    requestConfig: {
                      url: "/app/base_partners/operations/find",
                      method: "post",
                      params: {
                        fixedFilters: [
                          {
                            field: "categories",
                            operator: "exists",
                            filters: [{ field: "code", operator: "eq", value: "express_supplier" }],
                          },
                        ],
                        orderBy: [{ field: "name" }],
                      },
                    },
                  },
                })}
              </Form.Item>
              <Form.Item label="销售发货单号" name="fDeliveryCode" rules={[{ message: "销售发货单号" }]}>
                {renderRock({
                  context,
                  rockConfig: {
                    $type: "antdInput",
                    $id: `${props.$id}_f_delivery_code`,
                    placeholder: "请输入",
                  },
                })}
              </Form.Item>
            </>
          )}
          <Form.Item
            label="物品明细"
            name="items"
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 22 }}
            rules={[
              {
                validator: (r, val: any, cb) => {
                  let hasError = false;
                  let hasMultipleRecord = false;
                  let uniqueMap = new Map();
                  forEach(materialItems, (item) => {
                    if (!item.material) {
                      hasError = true;
                    } else {
                      let uniqueKey = `${item.material.id}_${item.lotNum || ""}`;
                      if (uniqueMap.get(uniqueKey)) {
                        hasMultipleRecord = true;
                      }
                      uniqueMap.set(uniqueKey, true);
                    }
                  });

                  if (hasError) {
                    cb("物品不可为空");
                    return;
                  }

                  if (hasMultipleRecord) {
                    cb("存在多条 “物料-批号” 相同的明细记录");
                    return;
                  }

                  cb();
                },
              },
            ]}
          >
            <Table
              size="middle"
              dataSource={materialItems}
              scroll={{ x: 740 }}
              columns={[
                {
                  title: "物品",
                  dataIndex: "material",
                  width: 180,
                  render: (_, r, i) => {
                    let fixedFilters: any[] = [];
                    if (operationType === "out" && warehouseId) {
                      fixedFilters.push({
                        field: "warehouse_id",
                        operator: "eq",
                        value: warehouseId,
                      });
                      return renderRock({
                        context,
                        rockConfig: {
                          $type: "rapidTableSelect",
                          $id: `${i}_warehouse_material`,
                          placeholder: "请选择",
                          dropdownMatchSelectWidth: 500,
                          listValueFieldName: "material.id",
                          listTextFormat: "{{material.code}}-{{material.name}}（{{material.specification}}）",
                          listFilterFields: [
                            {
                              field: "material",
                              operator: "exists",
                              filters: [
                                {
                                  operator: "or",
                                  filters: [
                                    {
                                      field: "name",
                                      operator: "contains",
                                    },
                                    {
                                      field: "code",
                                      operator: "contains",
                                    },
                                    {
                                      field: "specification",
                                      operator: "contains",
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                          searchPlaceholder: "物品信息搜索",
                          columns: [
                            { title: "名称", code: "material.name", width: 100 },
                            { title: "编号", code: "material.code", width: 100 },
                            { title: "规格", code: "material.specification", width: 100 },
                            { title: "单位", code: "unit.name", width: 80 },
                          ],
                          requestConfig: {
                            url: "/mom/mom_material_warehouse_inventory_balances/operations/find",
                            method: "post",
                            params: {
                              fixedFilters,
                              properties: ["id", "material", "unit"],
                              relations: {
                                material: {
                                  properties: ["id", "code", "name", "specification", "category"],
                                  category: true,
                                },
                              },
                              // orderBy: [{ field: "code" }],
                            },
                          },
                          value: r.material?.id,
                          onSelectedRecord: [
                            {
                              $action: "script",
                              script: (e: RockEvent) => {
                                const record: any = e.args[0];
                                setMaterialItems((draft) => {
                                  return draft.map((item, index) =>
                                    i === index
                                      ? {
                                          ...item,
                                          material: record?.material,
                                          unit: record?.unit,
                                          lotNum: undefined,
                                          binNum: undefined,
                                        }
                                      : item,
                                  );
                                });
                              },
                            },
                          ],
                        },
                      });
                    }

                    return renderRock({
                      context,
                      rockConfig: {
                        $type: "rapidTableSelect",
                        $id: `${i}_material`,
                        placeholder: "请选择",
                        dropdownMatchSelectWidth: 500,
                        listTextFormat: materialFormatStrTemplate,
                        listFilterFields: ["name", "code", "specification"],
                        searchPlaceholder: "物品信息搜索",
                        columns: [
                          { title: "名称", code: "name", width: 100 },
                          { title: "编号", code: "code", width: 100 },
                          { title: "规格", code: "specification", width: 100 },
                          { title: "单位", code: "defaultUnit.name", width: 80 },
                        ],
                        requestConfig: {
                          url: "/app/base_materials/operations/find",
                          method: "post",
                          params: {
                            fixedFilters,
                            properties: ["id", "code", "name", "specification", "defaultUnit", "category"],
                            orderBy: [{ field: "code" }],
                          },
                        },
                        value: r.material?.id,
                        onSelectedRecord: [
                          {
                            $action: "script",
                            script: (e: RockEvent) => {
                              const record: any = e.args[0];
                              setMaterialItems((draft) => {
                                return draft.map((item, index) =>
                                  i === index
                                    ? {
                                        ...item,
                                        material: record,
                                        unit: record?.defaultUnit,
                                        lotNum: undefined,
                                        binNum: undefined,
                                      }
                                    : item,
                                );
                              });
                            },
                          },
                        ],
                      },
                    });
                  },
                },
                {
                  title: "批号",
                  dataIndex: "lotNum",
                  width: 120,
                  render: (_, r, i) => {
                    return (
                      <LotSelect
                        context={context}
                        record={r}
                        recordIndex={i}
                        isSalesOut={isSalesOut}
                        warehouseId={warehouseId}
                        customerId={form.getFieldValue("customer")}
                        operationType={operationType!}
                        businessType={form.getFieldValue("businessType")}
                        businessTypeName={businessType}
                        onChange={(val) => {
                          setMaterialItems((draft) => {
                            return draft.map((item, index) => (i === index ? { ...item, lotNum: val } : item));
                          });
                        }}
                      />
                    );
                  },
                },
                ...(enabledBinNum ? [binNumColumn] : []),
                {
                  title: "数量",
                  dataIndex: "quantity",
                  width: 120,
                  render: (_, r, i) => {
                    return (
                      <InputNumber
                        placeholder="请输入"
                        disabled={!isEmpty(r.binNum)}
                        style={{ width: "100%" }}
                        value={r.quantity}
                        onChange={(val) => {
                          setMaterialItems((draft) => {
                            return draft.map((item, index) => (i === index ? { ...item, quantity: val } : item));
                          });
                        }}
                      />
                    );
                  },
                },
                {
                  title: "单位",
                  dataIndex: "unit",
                  width: 120,
                  render: (_, r, i) => {
                    return renderRock({
                      context,
                      rockConfig: {
                        $type: "rapidTableSelect",
                        $id: `${i}_unit`,
                        placeholder: "请选择",
                        pageSize: 1000,
                        listFilterFields: [],
                        columns: [{ title: "名称", code: "name" }],
                        requestConfig: { url: "/app/base_units/operations/find", method: "post" },
                        value: r.unit?.id,
                        onSelectedRecord: [
                          {
                            $action: "script",
                            script: (e: RockEvent) => {
                              const record: any = e.args[0];
                              setMaterialItems((draft) => {
                                return draft.map((item, index) => (i === index ? { ...item, unit: record } : item));
                              });
                            },
                          },
                        ],
                      },
                    });
                  },
                },
                {
                  title: "备注",
                  dataIndex: "remark",
                  width: 200,
                  render: (_, r, i) => {
                    return (
                      <Input
                        placeholder="请输入"
                        value={r.remark}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMaterialItems((draft) => {
                            return draft.map((item, index) => (i === index ? { ...item, remark: val } : item));
                          });
                        }}
                      />
                    );
                  },
                },
                {
                  width: 60,
                  render: (_, r, index) => {
                    return (
                      <span
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                          setMaterialItems(materialItems.filter((m, i) => i !== index));
                        }}
                      >
                        移除
                      </span>
                    );
                  },
                },
              ]}
              pagination={false}
            />
            <Button
              block
              type="dashed"
              onClick={() => {
                const newRecord = pick(last(materialItems), ["material", "unit"]);
                const lastRemark = materialItems[materialItems?.length - 1]?.remark;
                setMaterialItems([...materialItems, { ...newRecord, remark: lastRemark }]);
              }}
            >
              <PlusOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />
              添加
            </Button>
          </Form.Item>
          <Form.Item wrapperCol={{ span: 22, offset: 2 }} style={{ marginTop: 36 }}>
            <Space size={24}>
              <Button
                disabled={saving}
                onClick={() => {
                  navigate("/pages/mom_inventory_application_list");
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                loading={saving}
                onClick={() => {
                  form.submit();
                }}
              >
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    );
  },
} as Rock<any>;

function useSaveApplication(onSuccess: (data: Record<string, any>) => void) {
  const [saving, setSaving] = useState<boolean>(false);

  const saveApplication = async (formData: Record<string, any>) => {
    if (saving) {
      return;
    }

    setSaving(true);
    await rapidApi
      .post("/mom/mom_inventory_applications", formData)
      .then((res) => {
        if (res.status >= 200 && res.status < 400) {
          onSuccess(res.data);
        } else {
          message.error(res.data.error.message);
        }
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const save = useDebounceFn(saveApplication, { wait: 300 });

  return { saveApplication: save.run, saving };
}

const CustomerLotSelect = memo((props: any) => {
  const { loadCustomLots, loading, lots } = useCustomLots();

  useEffect(() => {
    if (props.materialId && props.customerId && props.inspectRuleId) {
      loadCustomLots({
        materialId: props.materialId,
        customerId: props.customerId,
        inspectRuleId: props.inspectRuleId,
        warehouseId: props.warehouseId,
      });
    }
  }, [props.materialId, props.customerId, props.inspectRuleId, props.warehouseId]);

  const options = useMemo(() => (lots || []).map((lot) => ({ label: lot.lotNum, value: lot.lotNum })), [lots]);

  return (
    <Select placeholder="请选择" style={{ width: "100%" }} options={options} loading={props.loading || loading} value={props.value} onChange={props.onChange} />
  );
});

function useCustomLots() {
  const [state, setState] = useSetState<{ loading?: boolean; lots?: any[] }>({});

  const loadCustomLots = async (params: { materialId: string; customerId: string; inspectRuleId: string; warehouseId?: string }) => {
    setState({ loading: true });

    const { error, result: lotResult } = await rapidApiRequest({
      url: "/app/listLotsByInspectRule",
      method: "POST",
      data: {
        inspectRuleId: params.inspectRuleId,
        materialId: params.materialId,
        customerId: params.customerId,
        warehouseId: params.warehouseId,
      },
    });

    if (!error) {
      setState({ lots: lotResult || [] });
    }

    setState({ loading: false });
  };

  return { loadCustomLots, ...state };
}

function useInspectionRule(params: { materialId: string; customerId: string }) {
  const [loading, setLoading] = useState<boolean>(false);
  const [inspectionRule, setInspectionRule] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!params.customerId || !params.materialId) {
        setInspectionRule(null);
        return;
      }

      setLoading(true);
      const { error, result } = await rapidApiRequest({
        url: "/mom/mom_inspection_rules/operations/find",
        method: "POST",
        data: {
          filters: [
            {
              field: "material_id",
              operator: "eq",
              value: params.materialId,
            },
            {
              field: "customer_id",
              operator: "eq",
              value: params.customerId,
            },
          ],
        },
      });

      const rule = result?.list?.[0];
      if (!error) {
        setInspectionRule(rule);
      }
      setLoading(false);
    })();
  }, [params.customerId, params.materialId]);

  return { loading, inspectionRule };
}
