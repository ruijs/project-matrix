import LinkshopApp from "./linkshop-app/LinkshopApp";
import LinkshopAppLayout from "./linkshop-app-layout/LinkshopAppLayout";
import LinkshopAppStep from "./linkshop-app-step/LinkshopAppStep";
import LinkshopBuilderAssetsPanel from "./linkshop-builder-assets-panel/LinkshopBuilderAssetsPanel";
import LinkshopBuilderBindableSelector from "./linkshop-builder-bindable-selector/LinkshopBuilderBindableSelector";
import LinkshopBuilderComponentExpressionSetter from "./linkshop-builder-component-expression-setter/LinkshopBuilderComponentExpressionSetter";
import LinkshopBuilderComponentsPanel from "./linkshop-builder-components-panel/LinkshopBuilderComponentsPanel";
import LinkshopBuilderLayoutPropertiesPanel from "./linkshop-builder-layout-properties-panel/LinkshopBuilderLayoutPropertiesPanel";
import LinkshopBuilderLayoutsPanel from "./linkshop-builder-layouts-panel/LinkshopBuilderLayoutsPanel";
import LinkshopBuilderRecordsPanel from "./linkshop-builder-records-panel/LinkshopBuilderRecordsPanel";
import LinkshopBuilderStepLayoutPreview from "./linkshop-builder-step-layout-preview/LinkshopBuilderStepLayoutPreview";
import LinkshopBuilderStepPropertiesPanel from "./linkshop-builder-step-properties-panel/LinkshopBuilderStepPropertiesPanel";
import LinkshopBuilderStepsPanel from "./linkshop-builder-steps-panel/LinkshopBuilderStepsPanel";
import LinkshopBuilderStoresPanel from "./linkshop-builder-stores-panel/LinkshopBuilderStoresPanel";
import LinkshopBuilderToolbar from "./linkshop-builder-toolbar/LinkshopBuilderToolbar";
import LinkshopBuilderTriggersPanel from "./linkshop-builder-triggers-panel/LinkshopBuilderTriggersPanel";
import LinkshopBuilderVariablesPanel from "./linkshop-builder-variables-panel/LinkshopBuilderVariablesPanel";
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
  LinkshopAppLayout,
  LinkshopAppStep,
  LinkshopBuilderAssetsPanel,
  LinkshopBuilderBindableSelector,
  LinkshopBuilderComponentExpressionSetter,
  LinkshopBuilderComponentsPanel,
  LinkshopBuilderLayoutPropertiesPanel,
  LinkshopBuilderLayoutsPanel,
  LinkshopBuilderRecordsPanel,
  LinkshopBuilderStepLayoutPreview,
  LinkshopBuilderStepPropertiesPanel,
  LinkshopBuilderStepsPanel,
  LinkshopBuilderStoresPanel,
  LinkshopBuilderTriggersPanel,
  LinkshopBuilderVariablesPanel,
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
