import type { Rock, RockConfig } from "@ruiapp/move-style";
import type { FindEntityOptions } from "@ruiapp/rapid-extension";
import { Button, Input, Modal, Switch, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import { debounce, filter, find, forEach, get, isArray, isPlainObject, last, omit, orderBy, split } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMergeState } from "~/hooks/use-merage-state";
import rapidApi from "~/rapidApi";
import rapidAppDefinition from "~/rapidAppDefinition";
import { calculateInspectionResult } from "~/utils/calculate";

interface ICurrentState {
  offset: number;
  keyword?: string;
  selectedRecordMap: Record<string, any>;
  selectRecord?: any;
  visible?: boolean;
  inputValue?: string;
  isFilter?: boolean;
  reloadKey?: string | number;
}

export default {
  $type: "filterMaterialLotNumSelector",

  propertyPanels: [],

  onInit(context, props) {
    const entity = rapidAppDefinition.entities.find((entity) => entity.code === "MomWarehouseStrategy");
    const store = {
      name: "momWarehouseStrategyList",
      type: "entityStore",
      entityModel: entity,
      properties: ["id", "materialCategory", "warehouse", "businessType", "strategy", "enabled", "qualifiedFilter", "validityFilter", "isAOD"],
      fixedFilters: [
        {
          field: "enabled",
          operator: "eq",
          value: true,
        },
      ],
    };

    context.scope.addStore(store);
    context.scope.stores[store.name]?.loadData();
  },

  Renderer(context, props: Record<string, any>) {
    const { materialId, businessTypeId, materialCategoryId, warehouseId, customerId } = props;
    const pageSize = 20;
    const listValueFieldName = "lotNum";
    const isMultiple = false;
    const [currentState, setCurrentState] = useMergeState<ICurrentState>({ offset: 0, selectedRecordMap: {} });
    const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");

    const { loadTableData, loadFilterTableData, customeMeasurements, setDataSource, filterDataSource, dataSource } = useLoadTableData();

    const debouncedCallBack = useCallback(
      debounce((m) => setDebouncedKeyword(m), 600),
      [],
    );

    const loadData = () => {
      let fixedFilters: FindEntityOptions["filters"] = [
        {
          field: "onHandQuantity",
          operator: "gt",
          value: 0,
        },
      ];

      if (materialId) {
        fixedFilters.push({
          field: "material",
          operator: "exists",
          filters: [
            {
              field: "id",
              operator: "eq",
              value: isPlainObject(materialId) ? get(materialId, "id") : materialId,
            },
          ],
        });
      }

      const warehouseStrategies = get(context.scope.getStore("momWarehouseStrategyList"), "data.list") || [];
      const currentStrategy = find(warehouseStrategies, (s) => s.businessType?.id === businessTypeId && s.materialCategory?.id === materialCategoryId);
      if (currentStrategy?.qualifiedFilter) {
        fixedFilters.push({
          field: "lot",
          operator: "exists",
          filters: [
            {
              field: "qualificationState",
              operator: "eq",
              value: "qualified",
            },
          ],
        });
      }

      if (currentStrategy?.isAOD) {
        const lotFilterIndex = fixedFilters.findIndex((f: any) => f.field === "lot");
        if (lotFilterIndex > -1) {
          (fixedFilters[lotFilterIndex] as any).filters = [
            {
              operator: "or",
              filters: [
                {
                  field: "isAOD",
                  operator: "eq",
                  value: true,
                },
                {
                  field: "qualificationState",
                  operator: "eq",
                  value: "qualified",
                },
              ],
            },
          ];
        } else {
          fixedFilters.push({
            field: "lot",
            operator: "exists",
            filters: [
              {
                field: "isAOD",
                operator: "eq",
                value: true,
              },
            ],
          });
        }
      }

      if (warehouseId) {
        fixedFilters.push({
          field: "warehouse_id",
          operator: "eq",
          value: warehouseId,
        });
      }

      let orderBy: { field: string; desc?: boolean }[] = [];
      if (currentStrategy?.strategy === "fifo") {
        orderBy = [{ field: "createdAt", desc: false }];
      }
      const properties = ["id", "lotNum", "material", "createdAt", "lot", "onHandQuantity"];
      const params: any = {
        filters: fixedFilters,
        orderBy,
        properties,
        pagination: {
          limit: pageSize,
          offset: currentState.offset,
        },
      };

      if (currentState.keyword) {
        params.filters.push({
          operator: "or",
          filters: [
            {
              field: "lotNum",
              operator: "contains",
              value: currentState.keyword,
              itemType: "text",
            },
          ],
        });
      }
      loadTableData(params);
    };

    const loadFilterData = () => {
      let fixedFilters: FindEntityOptions["filters"] = [
        {
          field: "onHandQuantity",
          operator: "gt",
          value: 0,
        },
      ];

      if (materialId) {
        fixedFilters.push({
          field: "material",
          operator: "exists",
          filters: [
            {
              field: "id",
              operator: "eq",
              value: isPlainObject(materialId) ? get(materialId, "id") : materialId,
            },
          ],
        });
      }

      const warehouseStrategies = get(context.scope.getStore("momWarehouseStrategyList"), "data.list") || [];
      const currentStrategy = find(warehouseStrategies, (s) => s.businessType?.id === businessTypeId && s.materialCategory?.id === materialCategoryId);
      if (currentStrategy?.qualifiedFilter) {
        fixedFilters.push({
          field: "lot",
          operator: "exists",
          filters: [
            {
              field: "qualificationState",
              operator: "eq",
              value: "qualified",
            },
          ],
        });
      }

      if (currentStrategy?.isAOD) {
        const lotFilterIndex = fixedFilters.findIndex((f: any) => f.field === "lot");
        if (lotFilterIndex > -1) {
          (fixedFilters[lotFilterIndex] as any).filters = [
            {
              operator: "or",
              filters: [
                {
                  field: "isAOD",
                  operator: "eq",
                  value: true,
                },
                {
                  field: "qualificationState",
                  operator: "eq",
                  value: "qualified",
                },
              ],
            },
          ];
        } else {
          fixedFilters.push({
            field: "lot",
            operator: "exists",
            filters: [
              {
                field: "isAOD",
                operator: "eq",
                value: true,
              },
            ],
          });
        }
      }

      if (warehouseId) {
        fixedFilters.push({
          field: "warehouse_id",
          operator: "eq",
          value: warehouseId,
        });
      }

      let orderBy: { field: string; desc?: boolean }[] = [];
      if (currentStrategy?.strategy === "fifo") {
        orderBy = [{ field: "createdAt", desc: false }];
      }
      const properties = ["id", "lotNum", "material", "createdAt", "lot", "onHandQuantity"];
      const params: any = {
        filters: fixedFilters,
        orderBy,
        properties,
        pagination: {
          limit: pageSize,
          offset: currentState.offset,
        },
      };

      if (currentState.keyword) {
        params.filters.push({
          operator: "or",
          filters: [
            {
              field: "lotNum",
              operator: "contains",
              value: currentState.keyword,
              itemType: "text",
            },
          ],
        });
      }
      loadFilterTableData(params);
    };

    const loadCustomeMeasurements = () => {
      const parmas = {
        filters: [
          {
            operator: "and",
            filters: [
              {
                field: "customer",
                operator: "eq",
                value: customerId,
              },
              {
                field: "material",
                operator: "exists",
                filster: [
                  {
                    field: "id",
                    operator: "eq",
                    value: materialId,
                  },
                ],
              },
            ],
          },
        ],
        orderBy: [
          {
            field: "id",
          },
        ],
        properties: ["id", "name", "material", "customer", "createdAt"],
      };
      customeMeasurements(parmas);
    };

    useEffect(() => {
      if (currentState.isFilter) {
        loadFilterData();
      } else {
        loadData();
      }
    }, [currentState.isFilter, currentState.offset, debouncedKeyword, materialId, materialCategoryId]);

    useEffect(() => {
      if (currentState.isFilter && debouncedKeyword) {
        const res = dataSource.list.filter((item: any) => item.lotNum.toLowerCase().includes(debouncedKeyword.toLowerCase()));
        setDataSource({
          list: res,
          total: res.length,
        });
      } else {
        setDataSource(filterDataSource);
      }
    }, [currentState.isFilter, debouncedKeyword]);

    useEffect(() => {
      if (materialId && customerId) {
        loadCustomeMeasurements();
      }
    }, [materialId, customerId]);

    const columns = [
      {
        title: "批次号",
        key: "lotNum",
        dataIndex: "lotNum",
        width: 180,
        fixed: "left",
      },
      {
        title: "在库数量",
        key: "onHandQuantity",
        dataIndex: "onHandQuantity",
        width: 120,
      },
      {
        title: "入库时间",
        key: "createdAt",
        dataIndex: "createdAt",
        width: 120,
        render: (v: any) => {
          return v ? dayjs(v).format("YYYY-MM-DD ") : "";
        },
      },
      {
        title: "检验状态",
        key: "qualificationState",
        dataIndex: "qualificationState",
        width: 120,
        render: (v: any, record: any) => {
          switch (record.lot?.qualificationState) {
            case "inspectFree":
              return "免检";
            case "uninspected":
              return "待检";
            case "qualified":
              return "合格";
            case "unqualified":
              if (record.lot?.treatment === "special") {
                return "不合格（特采）";
              } else if (record.lot?.treatment === "withdraw") {
                return "不合格（退货）";
              }
              return "不合格";
          }
        },
      },
      {
        title: "有效期",
        code: "lot",
        width: 120,
        render: (v: any, r: any) => {
          return r?.lot?.validityDate ? dayjs(r?.lot?.validityDate).format("YYYY-MM-DD ") : "";
        },
      },
    ] as any;

    const selectedKeys = useMemo(() => {
      let val: any | any[] = props.value != null ? props.value : [];
      if (!isArray(val)) {
        val = val || val === 0 ? [val] : [];
      }

      return val.map((item: any) => {
        if (isPlainObject(item)) {
          const lastCode = last(split(listValueFieldName, ".")) as any;

          return get(item, listValueFieldName) || get(item, lastCode);
        }
        return item;
      });
    }, [props.value]);

    useEffect(() => {
      const res = dataSource.list.find((item) => get(item, listValueFieldName) == props.value)?.lotNum;
      setCurrentState({
        inputValue: res,
      });
    }, [props.value, dataSource?.list]);
    const onSelectRows = (records: any[]) => {
      let keys = selectedKeys || [];
      setCurrentState({
        selectRecord: records[0],
      });
      let s = { ...currentState, selectedRecordMap: { ...currentState.selectedRecordMap } };

      forEach(records, (record) => {
        const recordValue = get(record, listValueFieldName);

        const isExisted = keys.some((k: any) => k === recordValue);

        if (isExisted) {
          keys = keys.filter((k: any) => k !== recordValue);
        } else {
          keys = [recordValue, ...keys];
        }

        s.selectedRecordMap[recordValue] = record;
        if (isExisted) {
          s.selectedRecordMap = omit(s.selectedRecordMap, recordValue);
        }
      });

      setCurrentState(s);

      props.onChange?.(isMultiple ? keys : keys[0]);

      const selectedRecords = keys.map((k: any) => s.selectedRecordMap[k]);
      const validRecords = filter(records, (record) => s.selectedRecordMap[get(record, listValueFieldName)] != null);

      props.onSelectedRecord?.(isMultiple ? validRecords : validRecords[0], selectedRecords, s);
    };

    return (
      <>
        <div style={{ display: "flex" }}>
          <Input value={currentState?.inputValue} disabled />
          {materialId ? (
            <Button
              type="link"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentState({
                  visible: true,
                });
              }}
            >
              选择
            </Button>
          ) : (
            <Tooltip placement="top" title={"请先选择物品"} trigger="click">
              <Button
                type="link"
                disabled
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentState({
                    visible: true,
                  });
                }}
              >
                选择
              </Button>
            </Tooltip>
          )}
        </div>
        <Modal
          width={800}
          className="pm-modal-selector-wrapple"
          open={currentState.visible}
          title={"选择批号"}
          onCancel={() =>
            setCurrentState({
              visible: false,
            })
          }
          onOk={() => {
            props?.form.setFieldValue("lotNum", get(currentState?.selectRecord, listValueFieldName));
            setCurrentState({
              inputValue: currentState?.selectRecord?.lotNum,
              visible: false,
            });
          }}
        >
          <div className="pm-table-selector--toolbar">
            <Input
              allowClear
              placeholder={"批次号搜索"}
              value={currentState.keyword}
              onChange={(e) => {
                const v = e.target.value;
                setCurrentState({ keyword: v, offset: 0 });
                debouncedCallBack(v);
              }}
            />
          </div>
          <div style={{ fontSize: 12, padding: 8 }}>
            <Switch checked={currentState.isFilter} onChange={(e) => setCurrentState({ isFilter: e })} />
            <span style={{ color: "GrayText", padding: 8 }}>{"(是否过滤不符合客户要求的批次)"}</span>
          </div>

          <Table
            rowKey={(record) => get(record, listValueFieldName)}
            dataSource={dataSource?.list}
            columns={columns}
            scroll={{ x: 600, y: 200 }}
            rowSelection={{
              fixed: true,
              type: "radio",
              selectedRowKeys: selectedKeys,
              onSelectAll(selected, selectedRows, changeRows) {
                onSelectRows(changeRows || []);
              },
              onSelect(record) {
                onSelectRows([record]);
              },
            }}
            pagination={{
              size: "small",
              current: currentState.offset / pageSize + 1,
              pageSize: pageSize,
              total: dataSource.total || 0,
              hideOnSinglePage: true,
              showSizeChanger: false,
              onChange(page) {
                setCurrentState({ offset: (page - 1) * pageSize });
              },
            }}
          ></Table>
        </Modal>
      </>
    );
  },
} as Rock;

const useLoadTableData = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [inspectionLoading, setInspectionLoading] = useState<boolean>(false);
  const [measurementLoading, setMeasurementLoading] = useState<boolean>(false);
  const [customeLoading, setCustomeLoading] = useState<boolean>(false);
  const [measurementloading, setMeaseurceLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<{
    list: any[];
    total: number;
  }>({
    list: [],
    total: 0,
  });
  const [customeMeasurementData, setCustomeMeasurementData] = useState<any[]>([]);
  const [originData, setOriginData] = useState<any[]>([]);
  const [filterDataSource, setFilterDataSource] = useState<{
    list: any[];
    total: number;
  }>({
    list: [],
    total: 0,
  });

  // 加载基础数据
  const loadTableData = async (parmas: any) => {
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await rapidApi.post(`/mom/mom_material_lot_inventory_balances/operations/find`, parmas);
      if (data) {
        setLoading(false);
        setOriginData(data.list);
        setDataSource(data);
      }
    } catch {
      setLoading(false);
    }
  };

  // 加载过滤后的数据
  const loadFilterTableData = async (params: any) => {
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await rapidApi.post(`/mom/mom_material_lot_inventory_balances/operations/find`, params);
      if (data) {
        const ids = data.list.map((item: any) => item.lot.id);
        const filters = [
          {
            field: "lot",
            operator: "in",
            itemType: "int4",
            value: ids,
          },
          {
            field: "state",
            operator: "eq",
            value: "inspected",
          },
        ].filter((item) => item.field !== "onHandQuantity");
        const filterParams = {
          ...params,
          filters,
          properties: [
            "id",
            "code",
            "state",
            "approvalState",
            "result",
            "material",
            "customer",
            "lot",
            "lotNum",
            "sampleCount",
            "inventoryOperation",
            "rule",
            "sender",
            "remark",
            "inspector",
            "reviewer",
            "round",
          ],
        };
        setOriginData(data.list);
        await getInspectionSheetItem(filterParams);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  // 获取批次号对应的检验单
  const getInspectionSheetItem = async (params: any) => {
    if (inspectionLoading) return;

    try {
      setInspectionLoading(true);
      const { data } = await rapidApi.post(`/mom/mom_inspection_sheets/operations/find`, params);
      const ids = data.list.map((item: any) => item.id);
      if (data) {
        await getMeasurements(ids, data.list);

        setInspectionLoading(false);
      }
    } catch {
      setInspectionLoading(false);
    }
  };

  // 获取检验单对应的检验特征
  const getMeasurements = async (ids: number[], inspectionData: any[]) => {
    if (measurementLoading) return;
    const params = {
      filters: [
        {
          field: "sheet",
          operator: "in",
          value: ids,
        },
      ],
      relations: {
        measurements: {
          properties: ["id", "isQualified", "qualitativeValue", "quantitativeValue", "sampleCode", "instrument", "characteristic", "locked", "round"],
        },
      },
      pagination: {
        limit: 1000,
        offset: 0,
      },
      properties: ["id", "code", "sheet", "measurements", "round"],
    };
    try {
      setMeasurementLoading(true);
      const { data } = await rapidApi.post(`/mom/mom_inspection_sheet_samples/operations/find`, params);
      if (data) {
        formaterData(data.list, inspectionData);
      }
    } catch {
      setMeasurementLoading(false);
    }
  };

  // 获取客户的检验特征
  const customeMeasurements = async (parmas: any) => {
    if (customeLoading) return;

    try {
      setCustomeLoading(true);
      const { data } = await rapidApi.post(`/mom/mom_inspection_rules/operations/find`, parmas);
      const id = data.list[0].id;
      getCustmerMeasurementItem(id);
      setCustomeLoading(false);
    } catch {
      setCustomeLoading(false);
    }
  };

  // 获取客户的检验特征项
  const getCustmerMeasurementItem = async (id: number) => {
    if (measurementloading) return;

    try {
      setMeaseurceLoading(true);
      const parmas = {
        filters: [
          {
            operator: "and",
            filters: [
              {
                field: "rule",
                operator: "exists",
                filters: [
                  {
                    field: "id",
                    operator: "eq",
                    value: id,
                  },
                ],
              },
            ],
          },
        ],
        orderBy: [
          {
            field: "id",
          },
        ],
        properties: [
          "id",
          "name",
          "skippable",
          "mustPass",
          "category",
          "kind",
          "norminal",
          "createdAt",
          "determineType",
          "qualitativeDetermineType",
          "upperLimit",
          "upperTol",
          "lowerLimit",
          "lowerTol",
        ],
      };
      const { data } = await rapidApi.post(`/mom/mom_inspection_characteristics/operations/find`, parmas);
      if (data) {
        setCustomeMeasurementData(data.list);
        setMeaseurceLoading(false);
      }
    } catch {
      setMeaseurceLoading(false);
    }
  };

  // 处理对比数据

  const formaterData = (data: any, inspectionData: any[]) => {
    const cusInspectionItem = customeMeasurementData.map((item) => item.name);
    const res = data
      .map((item: any) => {
        const filterInspection = item.measurements.filter((it: any) => cusInspectionItem.includes(it.characteristic.name));
        const isCheckQualified = filterInspection
          .map((item: any) => {
            const filterCusInspection = customeMeasurementData.find((it) => it.name === item.characteristic.name);
            const filterInspectionItemValue = item.characteristic.name == filterCusInspection.name ? item?.quantitativeValue || item?.qualitativeValue : "null";
            return {
              ...item,
              isCheckQualified: calculateInspectionResult(filterCusInspection, filterInspectionItemValue),
            };
          })
          .some((item: any) => item.isCheckQualified);
        return {
          ...item,
          isCheckQualified,
        };
      })
      .filter((item: any) => item.isCheckQualified);
    const filterDataSource = inspectionData
      .map((item: any) => {
        const sheetId = res.map((it: any) => it.sheet.id);
        if (sheetId.includes(item.id)) {
          return item.lot.id;
        } else {
          return null;
        }
      })
      .filter((item) => item);
    const result = originData.filter((item) => filterDataSource.includes(item.lot.id));
    setFilterDataSource({
      list: result,
      total: result.length,
    });
    setDataSource({
      list: result,
      total: result.length,
    });
  };

  return { loadTableData, loadFilterTableData, customeMeasurements, setDataSource, filterDataSource, loading, dataSource };
};
