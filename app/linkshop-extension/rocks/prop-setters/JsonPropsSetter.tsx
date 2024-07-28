import type { Rock, PropSetterRockConfigBase, RockMultiPropsSetterBase } from "@ruiapp/move-style";
import { renderSingleControlMultiPropsSetter } from "@ruiapp/designer-extension";

export interface JsonPropsSetterProps extends RockMultiPropsSetterBase<"jsonPropsSetter", any>, PropSetterRockConfigBase {}

export default {
  $type: "jsonPropsSetter",

  Renderer(context, props: JsonPropsSetterProps) {
    return renderSingleControlMultiPropsSetter(context, {
      ...props,
      control: {
        $type: "jsonSetterInput",
      },
      extra: {
        $type: "jsonValueDisplay",
      },
    });
  },
} as Rock;
