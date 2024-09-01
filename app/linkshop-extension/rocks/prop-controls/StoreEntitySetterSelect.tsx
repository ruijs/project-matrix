import { Rock, RockConfigBase, RockEvent, RockEventHandler, handleComponentEvent } from "@ruiapp/move-style";
import { EntityStoreConfig } from "@ruiapp/rapid-extension";
import { renderRock } from "@ruiapp/react-renderer";
import { useCallback } from "react";
import { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";

export interface StoreEntitySetterSelectProps extends RockConfigBase {
  $id: string;
  value?: EntityStoreConfig;
  onChange?: RockEventHandler;
}

export default {
  $type: "storeEntitySetterSelect",

  Renderer(context, props: StoreEntitySetterSelectProps) {
    const { page, framework, scope } = context;
    const { $id, onChange, value } = props;

    const designerStore = page.getStore<LinkshopAppDesignerStore>("designerStore");

    const stores = (designerStore.appConfig.stores || []) as EntityStoreConfig[];

    const onEntityChange = useCallback(
      (e: RockEvent) => {
        const code = e.args[0];
        const store = stores.find((store) => store.entityCode === code);
        //TODO: 应该只保存数据源的name或者id，而不是整个数据源配置。
        handleComponentEvent("onChange", framework, page, scope, props, onChange!, [store]);
      },
      [page, $id, onChange, stores],
    );

    return renderRock({
      context,
      rockConfig: {
        $type: "antdSelect",
        $id: `store-selector_${stores?.length}`,
        style: { width: "100%" },
        options: (stores || []).map((s) => ({ label: s.name, value: s.entityCode })),
        value: value?.entityCode,
        onChange: {
          $action: "script",
          script: onEntityChange,
        },
      },
    });
  },
} as Rock;
