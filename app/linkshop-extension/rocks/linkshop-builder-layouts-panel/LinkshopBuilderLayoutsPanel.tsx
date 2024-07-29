import type { Rock, RockConfig, RockEvent, RockEventHandlerScript, RockInstanceContext } from "@ruiapp/move-style";
import LinkshopBuilderStepsPanelMeta from "./LinkshopBuilderLayoutsPanelMeta";
import type { LinkshopBuilderLayoutsPanelRockConfig } from "./linkshop-builder-layouts-panel-types";
import type { LinkshopAppRockConfig, LinkshopAppLayoutRockConfig } from "~/linkshop-extension/linkshop-types";
import { useCallback, useMemo, useState } from "react";
import { find, forEach } from "lodash";
import type { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import { sendDesignerCommand } from "~/linkshop-extension/utilities/DesignerUtility";
import LayoutSettingsFormModal from "./LayoutSettingsFormModal";
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

enum ItemOperation {
  View = "view",
  Modify = "modify",
  Remove = "remove",
}

export interface LayoutNode {
  $nodeType: "step";
  $id: string;
  $type?: string;
  label: string;
  children?: LayoutNode[];
}

type ComponentState = {
  modalOpen?: boolean;
  layoutConfig?: LinkshopAppLayoutRockConfig;
};

export default {
  Renderer(context: RockInstanceContext, props: LinkshopBuilderLayoutsPanelRockConfig) {
    const { designerStoreName } = props;
    const designerStore = context.page.getStore<LinkshopAppDesignerStore>(designerStoreName || "designerStore");
    const shopfloorApp = designerStore.appConfig;
    const layouts = shopfloorApp?.layouts || [];

    const [state, setState] = useState<ComponentState>({});

    const onItemOperation = (key: ItemOperation, item: any) => {
      switch (key) {
        case ItemOperation.View:
          const selectedItemId = item.$id;
          designerStore.setDesignStage({
            type: "layout",
            layoutId: selectedItemId,
          });

          const currentLayout = designerStore.currentLayout;
          if (currentLayout) {
            const stores = designerStore.page.scope.config.stores || [];
            // designerStore.addLayoutPage(currentLayout);
            sendDesignerCommand(context.page, designerStore, {
              name: "setPageConfig",
              payload: {
                pageConfig: {
                  $id: "designPreviewPage",
                  stores,
                  layout: {
                    view: [
                      {
                        $id: "stepLayout",
                        $type: "linkshopBuilderStepLayoutPreview",
                        backgroundColor: currentLayout.backgroundColor,
                      },
                    ],
                  },
                  view: (currentLayout.children as RockConfig[]) || [],
                },
              },
            });
          }
          break;
        case ItemOperation.Modify:
          setState((draft) => {
            return { ...draft, layoutConfig: item, modalOpen: true };
          });
          break;
        case ItemOperation.Remove:
          designerStore.removeLayoutPage(item);
          break;
      }
    };

    const onAddLayoutPageClick = () => {
      setState((draft) => {
        return {
          ...draft,
          modalOpen: true,
          layoutConfig: undefined,
        } as ComponentState;
      });
    };

    if (!shopfloorApp) {
      return null;
    }

    return (
      <>
        <div className="lsb-sidebar-panel">
          <h3>布局模板</h3>
          {layouts?.map((layoutPage) => {
            const selected = layoutPage.$id === designerStore.currentLayout?.$id;
            return (
              <div
                key={layoutPage.$name}
                style={{ cursor: "pointer" }}
                className={`lsb-sidebar-panel--item rui-row-mid ${selected ? "lsb-sidebar-panel--item_selected" : ""}`}
                onClick={() => {
                  onItemOperation(ItemOperation.View, layoutPage);
                }}
              >
                <span className="rui-text-ellipsis rui-flex">{layoutPage.$name}</span>
                <Dropdown
                  menu={{
                    items: [
                      { label: "修改", key: ItemOperation.Modify },
                      { label: "删除", key: ItemOperation.Remove },
                    ],
                    onClick: ({ key }) => {
                      onItemOperation(key as ItemOperation, layoutPage);
                    },
                  }}
                >
                  <span className="lsb-sidebar-panel--item_icon rui-noshrink" style={{ marginLeft: 6 }}>
                    <EllipsisOutlined />
                  </span>
                </Dropdown>
              </div>
            );
          })}
          <div className="lsb-sidebar-panel--add_btn" onClick={onAddLayoutPageClick}>
            <PlusOutlined style={{ marginRight: 4 }} />
            添加模板
          </div>
        </div>
        <LayoutSettingsFormModal
          layouts={shopfloorApp.layouts}
          layoutConfig={state.layoutConfig}
          open={state.modalOpen || false}
          onFormSubmit={(layoutConfig) => {
            const commandName: keyof LinkshopAppDesignerStore = state.layoutConfig?.$id === layoutConfig?.$id ? "updateLayoutPage" : "addLayoutPage";
            designerStore[commandName](layoutConfig);
          }}
          onVisibleChange={(v) => {
            setState((draft) => {
              return { ...draft, modalOpen: v };
            });
          }}
        />
      </>
    );
  },

  ...LinkshopBuilderStepsPanelMeta,
} as Rock;
