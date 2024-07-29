import type { PropSetterRockConfigBase, Rock, RockSinglePropSetterBase, SelectRockPropSetter } from "@ruiapp/move-style";
import { renderSingleControlPropSetter } from "@ruiapp/designer-extension";
import { LinkshopAppDesignerStore } from "~/linkshop-extension/stores/LinkshopAppDesignerStore";
import { map } from "lodash";
import { useMemo } from "react";

export interface LinkshoStepLayoutPropSetterRockConfig extends RockSinglePropSetterBase<"selectPropSetter", string>, PropSetterRockConfigBase {
  showSearch?: boolean;
  allowClear?: boolean;
}

export default {
  $type: "linkshoStepLayoutPropSetter",

  Renderer(context, props: LinkshoStepLayoutPropSetterRockConfig) {
    const { showSearch, allowClear } = props;
    let options: SelectRockPropSetter["options"];

    const { page } = context;
    const designerStore = page.getStore<LinkshopAppDesignerStore>("designerStore");
    options = useMemo(() => {
      return map(designerStore.appConfig?.layouts, (layout: any) => {
        return {
          label: layout.$name,
          value: layout.$id,
        } as (typeof options)[0];
      });
    }, [designerStore.appConfig]);

    return renderSingleControlPropSetter(context, {
      ...props,
      control: {
        $type: "selectSetterInput",
        options,
        showSearch,
        allowClear,
      },
    });
  },
} as Rock;
