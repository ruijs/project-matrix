export type DeviceName = string;

export type TelemetryValuesOfDevices = Record<DeviceName, DeviceTelemetryValuesEntry[]>;

export type DeviceTelemetryValues = Record<string, DeviceTelemetryDataPointValueType>;

export type DeviceTelemetryValuesEntry =
  | DeviceTelemetryValues
  | {
      ts: number;
      values: DeviceTelemetryValues;
    };

export type DeviceTelemetryDataPoint = {
  ts: number;
  name: string;
  value: DeviceTelemetryDataPointValueType;
};

export type DeviceTelemetryDataPointValueType = string | number | boolean | Record<string, any>;

export type RuleTriggerConfig = {
  eventType: "measurement_change";
  sourceType: "type" | "thing";
  sourceCodes: string[];
  measurementCodes: string[];
};

export type RuleReactionConfig = {
  nodes: RuleReactionNodeConfig[];
};

export type RuleReactionNodeConfig = {
  type: "script";
  script: string;
};
