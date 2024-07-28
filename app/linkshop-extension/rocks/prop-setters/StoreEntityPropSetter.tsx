import { renderSingleControlPropSetter } from "@ruiapp/designer-extension";
import type { RockSinglePropSetterBase, PropSetterRockConfigBase, Rock } from "@ruiapp/move-style";

export interface StoreEntityPropSetterProps extends RockSinglePropSetterBase<"storeEntityPropSetter">, PropSetterRockConfigBase {}

export default {
  $type: "storeEntityPropSetter",

  Renderer(context, props: StoreEntityPropSetterProps) {
    return renderSingleControlPropSetter(context, {
      ...props,
      control: {
        $type: "storeEntitySetterSelect",
      },
    });
  },
} as Rock;
