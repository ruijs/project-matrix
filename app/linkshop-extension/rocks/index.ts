import LinkshopApp from "./linkshop-app/LinkshopApp";
import LinkshopAppStep from "./linkshop-app-step/LinkshopAppStep";
import LinkshopBuilderAssetsPanel from "./linkshop-builder-assets-panel/LinkshopBuilderAssetsPanel";
import LinkshopBuilderComponentsPanel from "./linkshop-builder-components-panel/LinkshopBuilderComponentsPanel";
import LinkshopBuilderLayoutsPanel from "./linkshop-builder-layouts-panel/LinkshopBuilderLayoutsPanel";
import LinkshopBuilderStepPropertiesPanel from "./linkshop-builder-step-properties-panel/LinkshopBuilderStepPropertiesPanel";
import LinkshopBuilderStepsPanel from "./linkshop-builder-steps-panel/LinkshopBuilderStepsPanel";
import LinkshopBuilderStoresPanel from "./linkshop-builder-stores-panel/LinkshopBuilderStoresPanel";
import LinkshopBuilderTriggersPanel from "./linkshop-builder-triggers-panel/LinkshopBuilderTriggersPanel";
import LinkshopBuilderToolbar from "./linkshop-builder-toolbar/LinkshopBuilderToolbar";
import LinkshopScannerProvider from "./linkshop-scanner-provider/LinkshopScannerProvider";

// setters
import DynamicArraySetterInput from "./prop-controls/DynamicArraySetterInput";
import DynamicArrayPropSetter from "./prop-setters/DynamicArrayPropSetter";
import StoreEntitySetterSelect from "./prop-controls/StoreEntitySetterSelect";
import StoreEntityPropSetter from "./prop-setters/StoreEntityPropSetter";
import TimePropSetter from "./prop-setters/TimePropSetter";
import EntitySetterSelect from "./prop-controls/EntitySetterSelect";
import EntityPropSetter from "./prop-setters/EntityPropSetter";
import JsonPropsSetter from "./prop-setters/JsonPropsSetter";

export default [
  LinkshopApp,
  LinkshopAppStep,
  LinkshopBuilderAssetsPanel,
  LinkshopBuilderComponentsPanel,
  LinkshopBuilderLayoutsPanel,
  LinkshopBuilderStepPropertiesPanel,
  LinkshopBuilderStepsPanel,
  LinkshopBuilderStoresPanel,
  LinkshopBuilderTriggersPanel,
  LinkshopBuilderToolbar,
  LinkshopScannerProvider,

  // setters
  DynamicArraySetterInput,
  DynamicArrayPropSetter,
  StoreEntitySetterSelect,
  StoreEntityPropSetter,
  TimePropSetter,
  EntitySetterSelect,
  EntityPropSetter,
  JsonPropsSetter,
];
