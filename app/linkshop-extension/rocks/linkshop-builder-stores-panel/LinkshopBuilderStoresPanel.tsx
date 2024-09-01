import type { Rock } from "@ruiapp/move-style";
import LinkshopBuilderStoresPanelMeta from "./LinkshopBuilderStoresPanelMeta";
import type { LinkshopBuilderStoresPanelRockConfig } from "./linkshop-builder-stores-panel-types";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import StoreSettingsFormModal from "./StoreSettingsFormModal";
import { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import { sendDesignerCommand } from "~/linkshop-extension/utilities/DesignerUtility";
import { EllipsisOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

enum StoreOperator {
  Modify = "modify",
  Remove = "remove",
}

export default {
  Renderer(context, props: LinkshopBuilderStoresPanelRockConfig) {
    const { page } = context;
    const { designerStoreName } = props;

    const [state, setState] = useState<{ visible?: boolean; entityStoreConfig?: any }>({});

    const designerStore = page.getStore<LinkshopAppDesignerStore>(designerStoreName || "designerStore");

    const appConfig = designerStore.appConfig!;
    const stores = appConfig.stores;

    const onStoreOperator = (key: StoreOperator, store: any) => {
      switch (key) {
        case StoreOperator.Modify:
          setState((draft) => {
            return { ...draft, entityStoreConfig: store, visible: true };
          });
          break;
        case StoreOperator.Remove:
          designerStore.removeEntityStore(store);
          break;
      }
    };

    return (
      <>
        <div className="lsb-sidebar-panel">
          <h3>数据查询</h3>
          <div
            className="lsb-sidebar-panel--add_btn"
            onClick={() => {
              setState((draft) => {
                return {
                  ...draft,
                  visible: true,
                  entityStoreConfig: null,
                };
              });
            }}
          >
            <span>
              <PlusOutlined style={{ marginRight: 4 }} />
              添加
            </span>
          </div>
          {stores?.map((s) => {
            return (
              <div key={s.name} className="lsb-sidebar-panel--item rui-row-mid">
                <span className="rui-text-ellipsis rui-flex">{s.name}</span>
                <Dropdown
                  menu={{
                    items: [
                      { label: "修改", key: StoreOperator.Modify },
                      { label: "删除", key: StoreOperator.Remove },
                    ],
                    onClick: ({ key }) => {
                      onStoreOperator(key as StoreOperator, s);
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
        </div>
        <StoreSettingsFormModal
          context={context}
          visible={state.visible || false}
          storeConfigs={stores as any[]}
          entityStoreConfig={state.entityStoreConfig}
          onVisibleChange={(v) => {
            setState((draft) => {
              return { ...draft, visible: v };
            });
          }}
          onFormSubmit={(storeConfig) => {
            if (state.entityStoreConfig) {
              designerStore.updateEntityStore(storeConfig);
            } else {
              designerStore.addEntityStore(storeConfig);
            }
          }}
        />
      </>
    );
  },

  ...LinkshopBuilderStoresPanelMeta,
} as Rock;
