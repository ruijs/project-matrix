import dayjs from "dayjs";
import type { DeviceTelemetryValuesEntry, DeviceTelemetryValues, TelemetryValuesOfDevices } from "../IotPluginTypes";
import TDengineAccessor from "rapid-plugins/iot/TDengineAccessor";
import type { IRpdServer, Logger } from "@ruiapp/rapid-core";

export default class TimeSeriesDataService {
  #server: IRpdServer;
  #logger: Logger;
  #tDEngineAccessor: TDengineAccessor;

  constructor(server: IRpdServer, tDEngineAccessor: TDengineAccessor) {
    this.#server = server;
    this.#logger = server.getLogger();
    this.#tDEngineAccessor = tDEngineAccessor;
  }

  async createTelemetryValuesOfDevices(telemetryValuesOfDevices: TelemetryValuesOfDevices) {
    for (const deviceName in telemetryValuesOfDevices) {
      const telemetryValuesList = telemetryValuesOfDevices[deviceName];
      for (const telemetryValuesItem of telemetryValuesList) {
        await this.createTelemetryValuesOfDevice(telemetryValuesItem);
      }
    }
  }

  async createTelemetryValuesOfDevice(entry: DeviceTelemetryValuesEntry) {
    let ts: number;
    let telemetryValues: DeviceTelemetryValues;
    if (entry.ts && entry.values) {
      ts = entry.ts as number;
      telemetryValues = entry.values as DeviceTelemetryValues;
    } else {
      ts = dayjs().valueOf();
      telemetryValues = entry as DeviceTelemetryValues;
    }

    await this.saveDeviceTelemetryValue(ts, telemetryValues);
  }

  async saveDeviceTelemetryValue(ts: number, telemetryValues: DeviceTelemetryValues) {
    const tableName = "weather_sh";
    const keys = Object.keys(telemetryValues);
    const values = keys.map((key) => telemetryValues[key]);

    const sql = `INSERT INTO ${tableName} (ts, ${keys.join(",")}) VALUES (NOW, ${values.join(",")})`;
    this.#logger.debug(`Executing sql in tdengine: ${sql}`);

    await this.#tDEngineAccessor.exec(sql);
  }
}
