import LinkshopApp from "./linkshop-app/LinkshopApp";
import LinkshopAppStep from "./linkshop-app-step/LinkshopAppStep";
import LinkshopBuilderAssetsPanel from "./linkshop-builder-assets-panel/LinkshopBuilderAssetsPanel";
import LinkshopBuilderComponentsPanel from "./linkshop-builder-components-panel/LinkshopBuilderComponentsPanel";
import LinkshopBuilderLayoutPropertiesPanel from "./linkshop-builder-layout-properties-panel/LinkshopBuilderLayoutPropertiesPanel";
import LinkshopBuilderLayoutsPanel from "./linkshop-builder-layouts-panel/LinkshopBuilderLayoutsPanel";
import LinkshopBuilderStepLayoutPreview from "./linkshop-builder-step-layout-preview/LinkshopBuilderStepLayoutPreview";
import LinkshopBuilderStepPropertiesPanel from "./linkshop-builder-step-properties-panel/LinkshopBuilderStepPropertiesPanel";
import LinkshopBuilderStepsPanel from "./linkshop-builder-steps-panel/LinkshopBuilderStepsPanel";
import LinkshopBuilderStoresPanel from "./linkshop-builder-stores-panel/LinkshopBuilderStoresPanel";
import LinkshopBuilderTriggersPanel from "./linkshop-builder-triggers-panel/LinkshopBuilderTriggersPanel";
import LinkshopBuilderToolbar from "./linkshop-builder-toolbar/LinkshopBuilderToolbar";
import LinkshopScannerProvider from "./linkshop-scanner-provider/LinkshopScannerProvider";

// setters
import DynamicArrayPropSetter from "./prop-setters/DynamicArrayPropSetter";
import DynamicArraySetterInput from "./prop-controls/DynamicArraySetterInput";
import EntityPropSetter from "./prop-setters/EntityPropSetter";
import EntitySetterSelect from "./prop-controls/EntitySetterSelect";
import JsonPropsSetter from "./prop-setters/JsonPropsSetter";
import LinkshopStepLayoutPropSetter from "./prop-setters/LinkshopStepLayoutPropSetter";
import StoreEntityPropSetter from "./prop-setters/StoreEntityPropSetter";
import StoreEntitySetterSelect from "./prop-controls/StoreEntitySetterSelect";
import TimePropSetter from "./prop-setters/TimePropSetter";

export default [
  LinkshopApp,
  LinkshopAppStep,
  LinkshopBuilderAssetsPanel,
  LinkshopBuilderComponentsPanel,
  LinkshopBuilderLayoutPropertiesPanel,
  LinkshopBuilderLayoutsPanel,
  LinkshopBuilderStepLayoutPreview,
  LinkshopBuilderStepPropertiesPanel,
  LinkshopBuilderStepsPanel,
  LinkshopBuilderStoresPanel,
  LinkshopBuilderTriggersPanel,
  LinkshopBuilderToolbar,
  LinkshopScannerProvider,

  // setters
  DynamicArrayPropSetter,
  DynamicArraySetterInput,
  EntityPropSetter,
  EntitySetterSelect,
  JsonPropsSetter,
  LinkshopStepLayoutPropSetter,
  StoreEntityPropSetter,
  StoreEntitySetterSelect,
  TimePropSetter,
];
