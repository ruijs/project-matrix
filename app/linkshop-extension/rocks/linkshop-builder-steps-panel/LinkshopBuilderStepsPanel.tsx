import type { Rock, RockConfig, RockInstanceContext, StoreConfig } from "@ruiapp/move-style";
import LinkshopBuilderStepsPanelMeta from "./LinkshopBuilderStepsPanelMeta";
import type { LinkshopBuilderStepsPanelRockConfig } from "./linkshop-builder-steps-panel-types";
import type { LinkshopAppLayoutRockConfig, LinkshopAppStepRockConfig } from "~/linkshop-extension/linkshop-types";
import { useState } from "react";
import type { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import { sendDesignerCommand } from "~/linkshop-extension/utilities/DesignerUtility";
import StepSettingsFormModal from "./StepSettingsFormModal";
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LinkshopAppRuntimeStateStoreConfig } from "~/linkshop-extension/stores/LinkshopAppRuntimeStateStore";

enum StepOperator {
  View = "view",
  Modify = "modify",
  Remove = "remove",
  Copy = "copy",
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

function SortableItem(props: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: "flex",
    flexDireaction: "row",
    cursor: "move",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <svg viewBox="0 0 20 20" width="12" {...listeners}>
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
      </svg>
      {props.children}
    </div>
  );
}

export default {
  Renderer(context: RockInstanceContext, props: LinkshopBuilderStepsPanelRockConfig) {
    const { designerStoreName } = props;
    const designerStore = context.page.getStore<LinkshopAppDesignerStore>(designerStoreName || "designerStore");
    const shopfloorApp = designerStore.appConfig;
    const steps = shopfloorApp?.steps || [];

    const [state, setState] = useState<{ visible?: boolean; stepConfig?: LinkshopAppStepRockConfig }>({});

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;

      if (!active || !over) return;

      if (active.id !== over?.id) {
        const ids = steps.map((step) => step.$id);
        const oldIndex = ids.indexOf(active.id as string);
        const newIndex = ids.indexOf(over.id as string);
        const data = arrayMove(steps, oldIndex, newIndex);
        designerStore.updateSteps(data);

        return data;
      }
    }

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
            let layoutOfCurrentStep: LinkshopAppLayoutRockConfig | undefined;
            if (currentStep.layoutId) {
              layoutOfCurrentStep = designerStore.getLayoutById(currentStep.layoutId);
            }

            const appConfig = designerStore.appConfig!;
            const initialVars = {
              linkshopAppConfig: {
                stores: appConfig.stores,
              },
            };
            const stores: StoreConfig[] = [
              {
                type: "linkshopAppRuntimeStateStore",
                name: "runtimeStore",
                variables: appConfig.variables,
                records: appConfig.records,
              } as LinkshopAppRuntimeStateStoreConfig,
              //TODO: appConfig中的stores配置应仅作声明用，Page.stores中的entity stores应由组件在渲染时创建
              ...(appConfig.stores || []),
            ];
            // TODO: 此处应该只更改view和layout配置。
            sendDesignerCommand(context.page, designerStore, {
              name: "setPageConfig",
              payload: {
                pageConfig: {
                  $id: "designPreviewPage",
                  initialVars,
                  stores,
                  layout: {
                    view: [
                      {
                        $id: "stepLayout",
                        $type: "linkshopBuilderStepLayoutPreview",
                        backgroundColor: currentStep.backgroundColor || layoutOfCurrentStep?.backgroundColor,
                        children: layoutOfCurrentStep?.children,
                      },
                    ],
                  },
                  view: (currentStep.children as RockConfig[]) || [],
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
        case StepOperator.Copy:
          sendDesignerCommand(context.page, designerStore, {
            name: "copyStep",
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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={steps.map((step) => step.$id as string)} strategy={verticalListSortingStrategy}>
              {steps.map((s) => {
                const selected = s.$id === designerStore.currentStep?.$id;

                return (
                  <SortableItem key={s.$id} id={s.$id as string}>
                    <div
                      key={s.id}
                      style={{ cursor: "pointer", flex: 1, marginLeft: 4 }}
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
                            { label: "复制", key: StepOperator.Copy },
                          ],
                          onClick: ({ key }) => {
                            onStepOperator(key as StepOperator, s);
                          },
                        }}
                      >
                        <span className="lsb-sidebar-panel--item_icon rui-noshrink" style={{ marginLeft: 6 }}>
                          <EllipsisOutlined></EllipsisOutlined>
                        </span>
                      </Dropdown>
                    </div>
                  </SortableItem>
                );
              })}
            </SortableContext>
          </DndContext>
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
