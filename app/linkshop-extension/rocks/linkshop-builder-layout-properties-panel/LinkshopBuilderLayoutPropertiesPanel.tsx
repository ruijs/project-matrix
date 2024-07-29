import type { Rock, RockConfig, RockEvent, RockInstanceContext, RockPropSetter } from "@ruiapp/move-style";
import linkshopBuilderLayoutPropertiesPanel from "./LinkshopBuilderLayoutPropertiesPanelMeta";
import type { LinkshopBuilderLayoutPropertiesPanelRockConfig } from "./linkshop-builder-layout-properties-panel-types";
import { useMemo } from "react";
import { renderRockChildren } from "@ruiapp/react-renderer";
import type { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import { sendDesignerCommand } from "~/linkshop-extension/utilities/DesignerUtility";

export default {
  Renderer(context: RockInstanceContext, props: LinkshopBuilderLayoutPropertiesPanelRockConfig) {
    const { framework } = context;
    const { $id, designerStore } = props;
    const currentLayout = designerStore.currentLayout;

    const rockChildrenConfig = useMemo(() => {
      if (!currentLayout) {
        return null;
      }

      const rockMeta = framework.getComponent("linkshopAppLayout");
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
            ...propertyPanel,
            $id: `${$id}-${panelRockType}`,
            componentConfig: currentLayout,
            onPropValueChange: [
              {
                $action: "script",
                script: (event: RockEvent) => {
                  const { page } = event;
                  const designerStore = page.getStore<LinkshopAppDesignerStore>("designerStore");
                  const currentLayoutId = designerStore.currentLayout?.$id;
                  if (!currentLayoutId) {
                    return;
                  }
                  const props = event.args[0];

                  designerStore.updateLayoutPage({
                    ...props,
                    $id: currentLayoutId,
                  });

                  if (props.hasOwnProperty("backgroundColor")) {
                    sendDesignerCommand(context.page, designerStore, {
                      name: "setComponentProperty",
                      payload: {
                        componentId: "stepLayout",
                        propName: "backgroundColor",
                        propValue: props.backgroundColor,
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
                  const currentLayoutId = store.currentLayout?.$id;
                  if (!currentLayoutId) {
                    return;
                  }
                  const [propName, propExpression] = event.args;
                  store.setLayoutPagePropertyExpression(currentLayoutId, propName, propExpression);
                },
              },
            ],
            onPropExpressionRemove: [
              {
                $action: "script",
                script: (event: RockEvent) => {
                  const { page } = event;
                  const store = page.getStore<LinkshopAppDesignerStore>("designerStore");
                  const currentLayoutId = store.currentLayout?.$id;
                  if (!currentLayoutId) {
                    return;
                  }
                  const [propName] = event.args;
                  store.removeLayoutPagePropertyExpression(currentLayoutId, propName);
                },
              },
            ],
          } as RockConfig);
        }
      }
      return panelRocks;
    }, [framework, $id, currentLayout]);

    if (!designerStore) {
      return null;
    }

    if (!currentLayout) {
      return null;
    }

    return <div>{renderRockChildren({ context, rockChildrenConfig })}</div>;
  },

  ...linkshopBuilderLayoutPropertiesPanel,
} as Rock;
