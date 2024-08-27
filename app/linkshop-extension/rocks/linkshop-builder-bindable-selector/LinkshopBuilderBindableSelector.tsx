import { handleComponentEvent, type Rock, type RockConfig, type RockEvent, type RockEventHandlerHandleEvent, type RockInstance } from "@ruiapp/move-style";
import LinkshopBuilderBindableSelectorMeta from "./LinkshopBuilderBindableSelectorMeta";
import { renderRock } from "@ruiapp/react-renderer";
import type { LinkshopBuilderBindableSelectorRockConfig } from "./linkshop-builder-bindable-selector-types";
import { LinkshopAppRuntimeState } from "~/linkshop-extension/bindables/LinkshopAppRuntimeState";
import { BindableObjectMeta } from "@ruiapp/data-binding-extension";

export type ComponentMethods = {};

export type ComponentInstance = RockInstance<LinkshopBuilderBindableSelectorRockConfig, LinkshopBuilderBindableSelectorState, ComponentMethods>;

export interface LinkshopBuilderBindableSelectorState {}

export interface BindableElement {
  id: string;
  name: string;
  dataType: string;
  parentId: string;
}

export default {
  Renderer(context, props: LinkshopBuilderBindableSelectorRockConfig, state: LinkshopBuilderBindableSelectorState, instance: ComponentInstance) {
    const { page, framework, scope } = context;
    const { $id, runtimeState, selectedBindableKey, onSelectedBindableKeyChange, expandedBindableKeys, onExpandedBindableKeysChange } = props;

    const bindableElements: BindableElement[] = getBindableElementsFromRuntimeState(runtimeState);

    const rockConfig: RockConfig = {
      $id: `${$id}-table`,
      $type: "rapidTable",
      height: "500px",
      size: "small",
      rowKey: "id",
      showHeader: true,
      convertListToTree: true,
      listIdField: "id",
      listParentField: "parentId",
      treeChildrenField: "children",
      dataSource: bindableElements,
      expandedRowKeys: expandedBindableKeys,
      columns: [
        {
          $type: "rapidTableColumn",
          code: "name",
          title: "对象名",
        },
        {
          $type: "rapidTableColumn",
          code: "dataType",
          title: "数据类型",
          width: "80px",
        },
      ],
      pagination: false,
      rowSelection: {
        type: "radio",
        selectedRowKeys: selectedBindableKey ? [selectedBindableKey] : [],
        onChange: [
          {
            $action: "handleEvent",
            eventName: "onSelectedBindableKeyChange",
            handlers: onSelectedBindableKeyChange,
            $exps: {
              args: `[$event.args[0][0]]`,
            },
          } as RockEventHandlerHandleEvent,
        ],
      },
      onRowClick: [
        {
          $action: "handleEvent",
          eventName: "onSelectedBindableKeyChange",
          handlers: onSelectedBindableKeyChange,
          $exps: {
            args: `[$event.args[0].record.id]`,
          },
        } as RockEventHandlerHandleEvent,
      ],
      onExpandedRowsChange: [
        {
          $action: "script",
          script: (event: RockEvent) => {
            handleComponentEvent("onExpandedBindableKeysChange", framework, page, scope, props, onExpandedBindableKeysChange!, [event.args[0]]);
          },
        },
      ],
    };

    return renderRock({
      context,
      rockConfig,
    });
  },

  ...LinkshopBuilderBindableSelectorMeta,
} as Rock;

function getBindableElementsFromRuntimeState(runtimeState: LinkshopAppRuntimeState) {
  const bindableElements: BindableElement[] = [];

  getBindableElementsFromBindableMeta(runtimeState._bindableMeta, bindableElements, "");

  return bindableElements;
}

function getBindableElementsFromBindableMeta(recordMeta: BindableObjectMeta, bindableElements: BindableElement[], parentId: string) {
  for (const fieldMeta of recordMeta.fields) {
    let id = fieldMeta.fieldName;
    if (parentId) {
      id = `${parentId}.${id}`;
    }

    const childMeta = fieldMeta.meta;
    bindableElements.push({
      id,
      parentId,
      name: childMeta.name || "",
      dataType: childMeta.type,
    });
    if (childMeta.type === "object") {
      getBindableElementsFromBindableMeta(childMeta, bindableElements, id);
    }
  }
}
