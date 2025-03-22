import type { Rock, RockConfig } from "@ruiapp/move-style";
import { FindEntityOptions } from "@ruiapp/rapid-extension";
import { renderRock } from "@ruiapp/react-renderer";
import { Tag } from "antd";
import { find, get, isPlainObject } from "lodash";
import rapidAppDefinition from "~/rapidAppDefinition";

export default {
  $type: "materialLotNumSelector",

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
    const { materialId, businessTypeId, materialCategoryId, warehouseId } = props;

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

    // TODO: 关联字段排序
    // if (currentStrategy?.validityFilter) {
    //   fixedFilters.push({
    //     field: "lot.validityDate",
    //     operator: "gte",
    //     value: dayjs().endOf("day").format(),
    //   });
    // }

    let orderBy: { field: string; desc?: boolean }[] = [];
    if (currentStrategy?.strategy === "fifo") {
      orderBy = [{ field: "createdAt", desc: false }];
    }
    // } else if (currentStrategy?.strategy === "fdfo") {
    //   orderBy = [{ field: "lot.validityDate", desc: true }];
    // }

    const rockConfig: RockConfig = {
      $id: `${props.$id}_${materialId}_${warehouseId}_lot_list`,
      $type: "rapidEntityTableSelect",
      listTextFieldName: "lotNum",
      listValueFieldName: "lotNum",
      listFilterFields: ["lotNum"],
      placeholder: "请选择",
      searchPlaceholder: "批次号搜索",
      allowClear: true,
      dropdownMatchSelectWidth: 700,
      columns: [
        {
          title: "批次号",
          code: "lotNum",
          width: 180,
          fixed: "left",
        },
        {
          title: "在库数量",
          code: "onHandQuantity",
          width: 80,
        },
        {
          title: "入库时间",
          code: "createdAt",
          width: 120,
          render: `_.get(record, 'createdAt') && dayjs(_.get(record, 'createdAt')).format('YYYY-MM-DD')`,
        },
        {
          title: "检验状态",
          code: "lot.qualificationState",
          width: 100,
          render: (value: any, record: any) => {
            switch (record.lot?.qualificationState) {
              case "inspectFree":
                return <Tag color="green">免检</Tag>;
              case "uninspected":
                return <Tag color="orange">待检</Tag>;
              case "qualified":
                return <Tag color="green">合格</Tag>;
              case "unqualified":
                if (record.lot?.treatment === "special") {
                  return <Tag color="green">不合格（特采）</Tag>;
                } else if (record.lot?.treatment === "withdraw") {
                  return <Tag color="red">不合格（退货）</Tag>;
                }

                return <Tag color="red">不合格</Tag>;
            }
          },
        },
        {
          title: "有效期",
          code: "lot.validityDate",
          width: 120,
          render: `_.get(record, 'lot.validityDate') && dayjs(_.get(record, 'lot.validityDate')).format('YYYY-MM-DD')`,
        },
      ],
      entityCode: warehouseId ? "MomMaterialLotWarehouseInventoryBalance" : "MomMaterialLotInventoryBalance",
      requestParams: {
        fixedFilters,
        orderBy,
        properties: ["id", "lotNum", "material", "createdAt", "lot", "onHandQuantity"],
      },
      value: props.value,
      onChange: props.onChange,
    };

    return renderRock({ context, rockConfig });
  },
} as Rock;
