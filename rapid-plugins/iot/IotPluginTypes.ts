export * from "./types/IotModelsTypes";

export type ThingCode = string;

export type PropertyCode = string;

export type Timestamp = number;

export type TelemetryValuesOfThings = Record<ThingCode, ThingTelemetryValuesEntry[]>;

export type ThingTelemetryValues = Record<PropertyCode, ThingTelemetryPropertyValueType>;

export type ThingTelemetryValuesEntry =
  | ThingTelemetryValues
  | {
      ts: Timestamp;
      values: ThingTelemetryValues;
    };

export type ThingTelemetryValueEntry = {
  ts: Timestamp;
  name: string;
  value: ThingTelemetryPropertyValueType;
};

export type ThingTelemetryTimestampValuePair = [Timestamp, ThingTelemetryPropertyValueType];

export type ThingTelemetryPropertyValueType = string | number | boolean | Record<string, any>;

export type RuleTriggerConfig = RulePropertyValueChangeTriggerConfig;

export type RulePropertyValueChangeTriggerConfig = {
  eventType: "property_value_change";
  sourceType: "type" | "thing";
  sourceCodes: string[];
  propertyCodes: string[];
};

export type RuleReactionConfig = {
  nodes: RuleReactionNodeConfig[];
};

export type RuleReactionNodeConfig = {
  type: "script";
  script: string;
};
