import type { PropSetterRockConfigBase, Rock, RockSinglePropSetterBase } from "@ruiapp/move-style";
import { renderSingleControlPropSetter } from "@ruiapp/designer-extension";

export interface TimePropSetterProps extends RockSinglePropSetterBase<"timePropSetter">, PropSetterRockConfigBase {}

export default {
  $type: "timePropSetter",

  Renderer(context, props: TimePropSetterProps) {
    return renderSingleControlPropSetter(context, {
      ...props,
      control: {
        $type: "rapidTimePicker",
      },
    });
  },
} as Rock;
