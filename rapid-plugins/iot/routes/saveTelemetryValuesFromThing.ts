import type { RpdRoute } from "@ruiapp/rapid-core";

export default {
  namespace: "svc",
  name: "svc.iot.saveTelemetryValuesFromThing",
  code: "svc.iot.saveTelemetryValuesFromThing",
  type: "RESTful",
  method: "POST",
  endpoint: "/svc/iot/v1/thing/telemetry",
  actions: [
    {
      code: "iotSaveTelemetryValuesFromThing",
    },
  ],
} satisfies RpdRoute;
