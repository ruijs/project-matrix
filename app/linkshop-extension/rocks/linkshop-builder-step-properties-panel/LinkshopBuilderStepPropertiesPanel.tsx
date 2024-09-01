import type { Rock, RockConfig, RockEvent, RockInstanceContext, StoreConfig } from "@ruiapp/move-style";
import LinkshopBuilderStepPropertiesPanelMeta from "./LinkshopBuilderStepPropertiesPanelMeta";
import type { LinkshopBuilderStepPropertiesPanelRockConfig } from "./linkshop-builder-step-properties-panel-types";
import { useMemo } from "react";
import { renderRockChildren } from "@ruiapp/react-renderer";
import { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import { sendDesignerCommand } from "~/linkshop-extension/utilities/DesignerUtility";
import { LinkshopAppLayoutRockConfig } from "~/linkshop-extension/linkshop-types";
import { LinkshopAppRuntimeStateStoreConfig } from "~/linkshop-extension/stores/LinkshopAppRuntimeStateStore";

export default {
  Renderer(context: RockInstanceContext, props: LinkshopBuilderStepPropertiesPanelRockConfig) {
    const { framework } = context;
    const { $id, designerStore } = props;
    const currentStep = designerStore.currentStep;

    const rockChildrenConfig = useMemo(() => {
      if (!currentStep) {
        return null;
      }

      const rockMeta = framework.getComponent("linkshopAppStep");
      if (!rockMeta) {
        return null;
      }

      const { propertyPanels } = rockMeta;
      const panelRocks: RockConfig[] = [];
      if (propertyPanels) {
        for (const propertyPanel of propertyPanels) {
          const panelRockType = propertyPanel.$type;

          // TODO: remove this section
          if (!framework.getComponent(panelRockType)) {
            continue;
          }

          panelRocks.push({
            $id: `${$id}-${panelRockType}`,
            $type: panelRockType,
            componentConfig: currentStep,
            setters: (propertyPanel as any).setters,
            onPropValueChange: [
              {
                $action: "script",
                script: (event: RockEvent) => {
                  const { page } = event;
                  const store = page.getStore<LinkshopAppDesignerStore>("designerStore");
                  const currentStep = store.currentStep;
                  if (!currentStep) {
                    return;
                  }

                  const props = event.args[0];
                  const currentStepId = store.currentStep.$id;
                  store.updateStep({
                    ...props,
                    $id: currentStepId,
                  });

                  let layoutOfCurrentStep: LinkshopAppLayoutRockConfig | undefined;
                  if (props.hasOwnProperty("backgroundColor")) {
                    if (currentStep.layoutId) {
                      layoutOfCurrentStep = designerStore.getLayoutById(currentStep.layoutId);
                    }
                    sendDesignerCommand(context.page, designerStore, {
                      name: "setComponentProperty",
                      payload: {
                        componentId: "stepLayout",
                        propName: "backgroundColor",
                        propValue: props.backgroundColor || layoutOfCurrentStep?.backgroundColor,
                      },
                    });
                  } else if (props.hasOwnProperty("layoutId")) {
                    const currentLayoutId = props.layoutId;
                    if (currentLayoutId) {
                      layoutOfCurrentStep = designerStore.getLayoutById(currentLayoutId);
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
                },
              },
            ],
            onPropExpressionChange: [
              {
                $action: "script",
                script: (event: RockEvent) => {
                  const { page } = event;
                  const store = page.getStore<LinkshopAppDesignerStore>("designerStore");
                  const currentStepId = store.currentStep?.$id;
                  if (!currentStepId) {
                    return;
                  }
                  const [propName, propExpression] = event.args;
                  store.setStepPropertyExpression(currentStepId, propName, propExpression);
                },
              },
            ],
            onPropExpressionRemove: [
              {
                $action: "script",
                script: (event: RockEvent) => {
                  const { page } = event;
                  const store = page.getStore<LinkshopAppDesignerStore>("designerStore");
                  const currentStepId = store.currentStep?.$id;
                  if (!currentStepId) {
                    return;
                  }
                  const [propName] = event.args;
                  store.removeStepPropertyExpression(currentStepId, propName);
                },
              },
            ],
          } as RockConfig);
        }
      }
      return panelRocks;
    }, [framework, $id, currentStep]);

    if (!designerStore) {
      return null;
    }

    if (!currentStep) {
      return null;
    }

    return <div>{renderRockChildren({ context, rockChildrenConfig })}</div>;
  },

  ...LinkshopBuilderStepPropertiesPanelMeta,
} as Rock;
