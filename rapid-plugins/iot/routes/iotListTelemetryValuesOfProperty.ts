import type { RpdRoute } from "@ruiapp/rapid-core";

export default {
  namespace: "svc",
  name: "svc.iot.listTelemetryValuesOfProperty",
  code: "svc.iot.listTelemetryValuesOfProperty",
  type: "RESTful",
  method: "GET",
  endpoint: "/svc/iot/property/telemetry",
  actions: [
    {
      code: "iotListTelemetryValuesOfProperty",
    },
  ],
} satisfies RpdRoute;
