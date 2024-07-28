import type { Rock, RockConfig, RockEvent, RockEventHandlerScript, RockInstanceContext } from "@ruiapp/move-style";
import LinkshopBuilderStepsPanelMeta from "./LinkshopBuilderStepsPanelMeta";
import type { LinkshopBuilderStepsPanelRockConfig } from "./linkshop-builder-steps-panel-types";
import type { LinkshopAppRockConfig, LinkshopAppStepRockConfig } from "~/linkshop-extension/linkshop-types";
import { useCallback, useMemo, useState } from "react";
import { find, forEach } from "lodash";
import type { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import { sendDesignerCommand } from "~/linkshop-extension/utilities/DesignerUtility";
import StepSettingsFormModal from "./StepSettingsFormModal";
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

enum StepOperator {
  View = "view",
  Modify = "modify",
  Remove = "remove",
}

export type StepTreeNode = StepNode | ComponentNode | SlotNode;

export interface StepNode {
  $nodeType: "step";
  $id: string;
  $type?: string;
  label: string;
  children?: StepTreeNode[];
}

export interface ComponentNode {
  $nodeType: "component";
  $id: string;
  $type?: string;
  label: string;
  children?: StepTreeNode[];
}

export interface SlotNode {
  $nodeType: "slot";
  $id: string;
  $componentId: string;
  $slotPropName: string;
  label: string;
  children?: StepTreeNode[];
}

export default {
  Renderer(context: RockInstanceContext, props: LinkshopBuilderStepsPanelRockConfig) {
    const { designerStoreName } = props;
    const designerStore = context.page.getStore<LinkshopAppDesignerStore>(designerStoreName || "designerStore");
    const shopfloorApp = designerStore.appConfig;
    const steps = shopfloorApp?.steps || [];

    const [state, setState] = useState<{ visible?: boolean; stepConfig?: LinkshopAppStepRockConfig }>({});

    const onStepOperator = (key: StepOperator, step: any) => {
      switch (key) {
        case StepOperator.View:
          const selectedSetpId = step.$id;
          designerStore.setDesignStage({
            type: "step",
            stepId: selectedSetpId,
          });

          const currentStep = designerStore.currentStep;
          if (currentStep) {
            const stores = designerStore.page.scope.config.stores || [];
            sendDesignerCommand(context.page, designerStore, {
              name: "setPageConfig",
              payload: {
                pageConfig: {
                  $id: "designPreviewPage",
                  stores,
                  view: currentStep.children || [],
                },
              },
            });
          }
          break;
        case StepOperator.Modify:
          setState((draft) => {
            return { ...draft, stepConfig: step, visible: true };
          });
          break;
        case StepOperator.Remove:
          sendDesignerCommand(context.page, designerStore, {
            name: "removeStep",
            payload: {
              step,
            },
          });
          break;
      }
    };

    if (!shopfloorApp) {
      return null;
    }

    return (
      <>
        <div className="lsb-sidebar-panel">
          <h3>步骤</h3>
          {steps?.map((s) => {
            const selected = s.$id === designerStore.currentStep?.$id;
            return (
              <div
                key={s.$name}
                style={{ cursor: "pointer" }}
                className={`lsb-sidebar-panel--item rui-row-mid ${selected ? "lsb-sidebar-panel--item_selected" : ""}`}
                onClick={() => {
                  onStepOperator(StepOperator.View, s);
                }}
              >
                <span className="rui-text-ellipsis rui-flex">{s.$name}</span>
                <Dropdown
                  menu={{
                    items: [
                      { label: "修改", key: StepOperator.Modify },
                      { label: "删除", key: StepOperator.Remove },
                    ],
                    onClick: ({ key }) => {
                      onStepOperator(key as StepOperator, s);
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
          <div
            className="lsb-sidebar-panel--add_btn"
            onClick={() => {
              setState((draft) => {
                return {
                  ...draft,
                  visible: true,
                  stepConfig: undefined,
                };
              });
            }}
          >
            <PlusOutlined style={{ marginRight: 4 }} />
            添加步骤
          </div>
        </div>
        <StepSettingsFormModal
          steps={shopfloorApp.steps}
          stepConfig={state.stepConfig}
          visible={state.visible || false}
          onFormSubmit={(config) => {
            sendDesignerCommand(context.page, designerStore, {
              name: state.stepConfig?.$id === config?.$id ? "modifyStep" : "addStep",
              payload: {
                step: config,
              },
            });
          }}
          onVisibleChange={(v) => {
            setState((draft) => {
              return { ...draft, visible: v };
            });
          }}
        />
      </>
    );
  },

  ...LinkshopBuilderStepsPanelMeta,
} as Rock;
