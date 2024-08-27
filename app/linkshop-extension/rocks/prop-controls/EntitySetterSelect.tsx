import { Rock, RockConfigBase, RockEvent, RockEventHandler, handleComponentEvent } from "@ruiapp/move-style";
import { EntityStoreConfig } from "@ruiapp/rapid-extension";
import { renderRock } from "@ruiapp/react-renderer";
import { useCallback, useState } from "react";
import { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import StoreSettingsFormModal from "../linkshop-builder-stores-panel/StoreSettingsFormModal";

export interface EntitySetterSelectProps extends RockConfigBase {
  $id: string;
  value?: EntityStoreConfig;
  onChange?: RockEventHandler;
}

export default {
  $type: "entitySetterSelect",

  Renderer(context, props: EntitySetterSelectProps) {
    const { page, framework, scope } = context;
    const { $id, onChange, value } = props;

    const [visible, setVisible] = useState<boolean>(false);

    return (
      <>
        {renderRock({
          context,
          rockConfig: {
            $type: "htmlElement",
            htmlTag: "a",
            $id: `entity_${value?.name}`,
            children: [
              {
                $type: "text",
                text: "Edit",
              },
            ],
            onClick: {
              $action: "script",
              script: () => {
                setVisible(true);
              },
            },
          },
        })}
        <StoreSettingsFormModal
          visible={visible}
          storeConfigs={[]}
          entityStoreConfig={value}
          onVisibleChange={(v) => {
            setVisible(v);
          }}
          onFormSubmit={(config) => {
            handleComponentEvent("onChange", framework, page, scope, props, onChange!, [config]);
          }}
        />
      </>
    );
  },
} as Rock;
