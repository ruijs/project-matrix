import type { RpdRoute } from "@ruiapp/rapid-core";

export default {
  namespace: "svc",
  name: "svc.iot.saveTelemetryValuesFromGateway",
  code: "svc.iot.saveTelemetryValuesFromGateway",
  type: "RESTful",
  method: "POST",
  endpoint: "/svc/iot/gateway/telemetry",
  actions: [
    {
      code: "iotSaveTelemetryValuesFromGateway",
    },
  ],
} satisfies RpdRoute;
