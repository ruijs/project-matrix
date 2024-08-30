import { handleComponentEvent, type Rock, type RockChildrenConfig, type RockConfig, type RockEvent } from "@ruiapp/move-style";
import { renderRock, renderRockChildren } from "@ruiapp/react-renderer";
import BusinessTableMeta from "./BusinessTableMeta";
import type { BusinessTableRockConfig, BusinessTableState } from "./business-table-types";
import { differenceBy, filter, findIndex, forEach, isArray, isEmpty, keyBy, map, reject, set, uniq } from "lodash";
import {
  EntityStore,
  EntityStoreConfig,
  RapidEntityListRockConfig,
  RapidExtensionSetting,
  RapidExtStorage,
  RapidTableColumnConfig,
  RapidToolbarRockConfig,
} from "@ruiapp/rapid-extension";
import { BusinessStoreConfig } from "~/app-extension/stores/business-store";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default {
  onResolveState(props, state) {
    return {
      selectedIds: [],
    };
  },

  onInit(context, props) {
    const dataSourceCode = props.dataSourceCode || "list";
    if (!context.scope.stores[dataSourceCode]) {
      const { columns, pageSize = 20 } = props;
      const properties: string[] = uniq(
        props.queryProperties || [
          "id",
          ...map(
            filter(columns, (column) => !!column.code),
            (column) => column.code,
          ),
          ...(props.extraProperties || []),
        ],
      );
      const listDataStoreConfig: BusinessStoreConfig = {
        type: "businessStore",
        name: dataSourceCode,
        requestParamsAdapter: props.requestParamsAdapter,
        responseDataAdapter: props.responseDataAdapter,
        url: props.requestConfig.url,
        fixedFilters: props.fixedFilters,
        properties,
        orderBy: props.orderBy || [
          {
            field: "id",
          },
        ],
        pagination:
          pageSize > 0
            ? {
                limit: pageSize,
                offset: ((props.pageNum || 1) - 1) * pageSize,
              }
            : undefined,
        $exps:
          pageSize > 0
            ? {
                "pagination.limit": `${pageSize}`,
                "pagination.offset": `(($scope.vars['stores-${dataSourceCode}-pageNum'] || 1) - 1) * ${pageSize}`,
              }
            : undefined,
      };
      context.scope.addStore(listDataStoreConfig);
    }
  },

  onReceiveMessage(message, state, props, rockInstance) {
    if (message.name === "refreshView") {
      rockInstance._scope.stores[props.dataSourceCode!]?.loadData();
    }
  },

  Renderer(context, props, state) {
    const { pageSize = 20 } = props;
    const { logger } = context;

    const [rerenderKey, setRerenderKey] = useState<string | number>("");

    const dataSourceCode = props.dataSourceCode || "list";
    useEffect(() => {
      const store = context.scope.getStore(dataSourceCode);
      if (store) {
        store.loadData();
      }
    }, [dataSourceCode]);

    const tableColumnRocks: RockConfig[] = [];

    const toolboxRockConfig = {
      $type: "rapidEntityListToolbox",
      $id: `${props.$id}_toolbox`,
      columns: props.columns,
      config: props.toolbox || {
        columnCacheKey: props.entityCode || props.entityName,
      },
      style: {
        marginBottom: "16px",
      },
      onRerender: [
        {
          $action: "script",
          script: () => {
            setRerenderKey(dayjs().unix());
          },
        },
      ],
      onReload: [
        {
          $action: "script",
          script: () => {
            context.scope.stores[props.dataSourceCode!]?.loadData();
          },
        },
      ],
    };

    let originColumns = props.columns || [];
    const cacheColumns = RapidExtStorage.get<any[]>(toolboxRockConfig.config.columnCacheKey);
    if (isArray(cacheColumns) && !isEmpty(cacheColumns)) {
      const diffOriginColumns = differenceBy(originColumns, cacheColumns, getColumnUniqueKey);
      const originByCodeMap = keyBy<RapidTableColumnConfig>(originColumns, getColumnUniqueKey);

      let sortedColumns: RapidEntityListRockConfig["columns"] = [];
      let showColumns: RapidEntityListRockConfig["columns"] = [];
      cacheColumns.forEach((col) => {
        const uniqueKey = getColumnUniqueKey(col as any);
        const originColumn = originByCodeMap[uniqueKey];
        if (originColumn) {
          sortedColumns.push(originColumn);
          if (!col.hidden) {
            showColumns.push(originColumn);
          }
        }
      });

      originColumns = [...showColumns, ...diffOriginColumns];
      toolboxRockConfig.columns = [...sortedColumns, ...diffOriginColumns];
    }

    originColumns.forEach((column) => {
      let cell: RockConfig | RockConfig[] | null = null;

      if (!column.title) {
        column.title = "";
      }

      if (column.cell) {
        cell = column.cell;
      } else if (column.type === "link") {
        const url: string | undefined = column.rendererProps?.url;
        const text: string | undefined = column.rendererProps?.text;
        if (url) {
          cell = {
            $type: "anchor",
            href: url,
            children: {
              $type: "text",
              $exps: {
                text: text ? `$rui.execVarText('${text}', $slot.record)` : "$slot.value",
              },
            },
            $exps: {
              href: `$rui.execVarText('${url}', $slot.record)`,
              ...(column.rendererProps?.$exps || {}),
            },
          };
        }
      } else if (column.type === "auto") {
        let fieldType = column.fieldType || "text";
        let rendererType = column.rendererType || RapidExtensionSetting.getDefaultRendererTypeOfFieldType(fieldType);
        let defaultRendererProps: any = RapidExtensionSetting.getDefaultRendererProps(fieldType, rendererType);
        let fieldTypeRelatedRendererProps: any = {};

        cell = {
          $type: rendererType,
          ...defaultRendererProps,
          ...fieldTypeRelatedRendererProps,
          ...column.rendererProps,
          $exps: {
            value: "$slot.value",
            ...(column.rendererProps?.$exps || {}),
          },
        };
      }

      const tableColumnRock: RockConfig = {
        ...column,
        $type: "rapidTableColumn",
        cell,
      };
      tableColumnRocks.push(tableColumnRock);
    });

    if (!props.hideActionsColumn) {
      forEach(props.actions, (recordActionConfig) => {
        set(recordActionConfig, "$exps.record", "$slot.record");
        set(recordActionConfig, "$exps.recordId", "$slot.record.id");
      });

      if (props.actions && props.actions.length) {
        const tableActionsColumnRock: RockConfig = {
          $type: "rapidTableColumn",
          title: "操作",
          code: "id",
          key: "_actions",
          width: props.actionsColumnWidth || "150px",
          fixed: "right",
          cell: props.actions,
        };
        tableColumnRocks.push(tableActionsColumnRock);
      }
    }

    let rowSelection = null;
    const selectionMode = props.selectionMode || "multiple";
    if (selectionMode !== "none") {
      rowSelection = {
        type: selectionMode === "multiple" ? "checkbox" : "radio",
        onChange: [
          {
            $action: "setVars",
            $exps: {
              [`vars.${props.$id}-selectedIds`]: "$event.args[0]",
              [`vars.${props.$id}-selectedRecords`]: "$event.args[1]",
            },
          },
          {
            $action: "handleEvent",
            eventName: "onSelectedIdsChange",
            handlers: props.onSelectedIdsChange,
            $exps: {
              args: "[{selectedIds: $event.args[0], selectedRecords: $event.args[1]}]",
            },
          },
        ],
      };
    }

    const tableRockConfig: RockConfig = {
      $id: `${props.$id}-table`,
      $type: "rapidTable",
      $exps: {
        dataSource: `$scope.stores.${dataSourceCode}.data?.list`,
        pagination:
          pageSize > 0
            ? `{pageSize: ${pageSize}, current: $scope.vars["${`stores-${dataSourceCode}-pageNum`}"], total: $scope.stores.${dataSourceCode}.data?.total}`
            : "false",
        ...(selectionMode !== "none"
          ? {
              "rowSelection.selectedRowKeys": `$scope.vars['${props.$id}-selectedIds']`,
            }
          : {}),
      },
      size: "small",
      rowKey: "id",
      rowSelection,
      columns: tableColumnRocks,
      showHeader: props.showHeader,
      ...props.tableProps,
      convertListToTree: props.convertListToTree,
      listIdField: props.listIdField,
      listParentField: props.listParentField,
      treeChildrenField: props.treeChildrenField,
      onRowClick: props.selectOnClickRow
        ? [
            {
              $action: "script",
              script: async (event: RockEvent) => {
                const { framework, page, scope } = event;
                let nextSelectedIds = [];
                let nextSelectedRecords = [];
                const { record } = event.args?.[0];
                const recordId = record.id;
                if (selectionMode === "single") {
                  nextSelectedIds.push(recordId);
                  nextSelectedRecords.push(record);
                } else if (selectionMode === "multiple") {
                  const currentSelectedIds = scope.vars[`${props.$id}-selectedIds`] || [];
                  const currentSelectedRecords = scope.vars[`${props.$id}-selectedRecords`] || [];
                  if (findIndex(currentSelectedIds, (item) => item === recordId) === -1) {
                    nextSelectedIds = [...currentSelectedIds, recordId];
                    nextSelectedRecords = [...currentSelectedRecords, record];
                  } else {
                    nextSelectedIds = reject(currentSelectedIds, (item) => item === recordId);
                    nextSelectedRecords = reject(currentSelectedRecords, (item) => item.id === recordId);
                  }
                }
                scope.setVars({
                  [`${props.$id}-selectedIds`]: nextSelectedIds,
                  [`${props.$id}-selectedRecords`]: nextSelectedRecords,
                });
                handleComponentEvent("onSelectedIdsChange", framework, page as any, scope, props, props.onSelectedIdsChange || [], [
                  {
                    selectedIds: nextSelectedIds,
                    selectedRecords: nextSelectedRecords,
                  },
                ]);
              },
            },
          ]
        : null,
      onChange: [
        {
          $action: "script",
          script: async (event: RockEvent) => {
            const pagination = event.args?.[0];
            const store: EntityStore = event.scope.stores[dataSourceCode] as any;
            // store.setPagination({
            //   limit: props.pageSize,
            //   offset: ((pagination.current || 1) - 1) * props.pageSize
            // });
            event.scope.setVars({
              [`stores-${dataSourceCode}-pageNum`]: pagination.current,
            });
            await store.loadData();
          },
        },
      ],
    };

    const toolbarRockConfig: RapidToolbarRockConfig = {
      $id: `${props.$id}-toolbar`,
      $type: "rapidToolbar",
      items: props.listActions,
      extras: props.extraActions,
      dataSourceCode: props.dataSourceCode,
    };

    const rockChildrenConfig: RockChildrenConfig = [toolbarRockConfig, toolboxRockConfig, tableRockConfig];

    return renderRockChildren({ context, rockChildrenConfig });
  },

  ...BusinessTableMeta,
} as Rock<BusinessTableRockConfig, BusinessTableState>;

export function getColumnUniqueKey(column: RapidTableColumnConfig): string {
  return column?.key || column?.code;
}
