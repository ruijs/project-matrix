import { renderSingleControlPropSetter } from "@ruiapp/designer-extension";
import type { Rock, RockSinglePropSetterBase, PropSetterRockConfigBase } from "@ruiapp/move-style";

export interface EntityPropSetterProps extends RockSinglePropSetterBase<"entityPropSetter">, PropSetterRockConfigBase {}

export default {
  $type: "entityPropSetter",

  Renderer(context, props: EntityPropSetterProps) {
    return renderSingleControlPropSetter(context, {
      ...props,
      control: {
        $type: "entitySetterSelect",
      },
    });
  },
} as Rock;
