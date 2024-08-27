import type { Rock } from "@ruiapp/move-style";
import LinkshopBuilderRecordsPanelMeta from "./LinkshopBuilderRecordsPanelMeta";
import type { LinkshopBuilderRecordsPanelRockConfig } from "./linkshop-builder-records-panel-types";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import RecordSettingsFormModal from "./RecordSettingsFormModal";
import { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import { EllipsisOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

enum RecordOperator {
  Modify = "modify",
  Remove = "remove",
}

export default {
  Renderer(context, props: LinkshopBuilderRecordsPanelRockConfig) {
    const { page } = context;
    const { designerStoreName } = props;

    const [state, setState] = useState<{ visible?: boolean; recordConfig?: any }>({});

    const designerStore = page.getStore<LinkshopAppDesignerStore>(designerStoreName || "designerStore");

    const records = designerStore.appConfig?.records;

    const onRecordOperator = (key: RecordOperator, recordConfig: any) => {
      switch (key) {
        case RecordOperator.Modify:
          setState((draft) => {
            return { ...draft, recordConfig, visible: true };
          });
          break;
        case RecordOperator.Remove:
          designerStore.removeVariable(recordConfig);
          break;
      }
    };

    return (
      <>
        <div className="lsb-sidebar-panel">
          <h3>数据记录</h3>
          <div
            className="lsb-sidebar-panel--add_btn"
            onClick={() => {
              setState((draft) => {
                return {
                  ...draft,
                  visible: true,
                  recordConfig: null,
                };
              });
            }}
          >
            <span>
              <PlusOutlined style={{ marginRight: 4 }} />
              添加
            </span>
          </div>
          {records?.map((item) => {
            return (
              <div key={item.name} className="lsb-sidebar-panel--item rui-row-mid">
                <span className="rui-text-ellipsis rui-flex">{item.name}</span>
                <Dropdown
                  menu={{
                    items: [
                      { label: "修改", key: RecordOperator.Modify },
                      { label: "删除", key: RecordOperator.Remove },
                    ],
                    onClick: ({ key }) => {
                      onRecordOperator(key as RecordOperator, item);
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
        <RecordSettingsFormModal
          context={context}
          visible={state.visible || false}
          recordConfigs={records as any[]}
          recordConfig={state.recordConfig}
          onVisibleChange={(v) => {
            setState((draft) => {
              return { ...draft, visible: v };
            });
          }}
          onFormSubmit={(config) => {
            if (state.recordConfig) {
              designerStore.updateRecord(config);
            } else {
              designerStore.addRecord(config);
            }
          }}
        />
      </>
    );
  },

  ...LinkshopBuilderRecordsPanelMeta,
} as Rock;
