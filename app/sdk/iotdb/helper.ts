import {IRpdServer} from "@ruiapp/rapid-core";
import IotDBSDK from "~/sdk/iotdb/sdk";

class IotDBHelper {
  private server: IRpdServer;

  constructor(server: IRpdServer) {
    this.server = server;
  }

  public async NewAPIClient() {
    return new IotDBSDK({
      baseURL: "http://10.0.0.3:6670"
    });
  }
}


export interface IotDBQueryInput {
  sql: string,
}

export interface TimeSeriesQueryOutput {
  expressions: string[],
  column_names: string[],
  timestamps: number[],
  values: Array<Array<number | string | null>>,
}

export interface LastTimeSeriesQueryOutput {
  expressions: string[],
  column_names: string[],
  timestamps: number[],
  values: Array<Array<string>>,
}

// 定义单个时间戳和值的结构
interface DataPoint {
  timestamp: number;
  value: number | string | null;
}

// 定义每个设备下的度量数据（例如: b_temperature, a_temperature 等）
interface DeviceMetrics {
  [metricCode: string]: DataPoint[];
}

// 定义整个数据结构，设备代码 (deviceCode) 是动态的
interface DevicesData {
  [deviceCode: string]: DeviceMetrics;
}

export default IotDBHelper;

export function ParseDeviceData(payload: TimeSeriesQueryOutput): DevicesData {
  const { expressions, timestamps, values } = payload;

  // Create a result object that conforms to DevicesData
  const result: DevicesData = {};

  // Loop through expressions to dynamically extract device_code and metric_code
  expressions.forEach((expression, idx) => {
    // Match the expression to extract the device_code and metric_code
    const match = expression.match(/root.*?\.devices\.reports\.(\w+)\.(\w+)/);

    if (match) {
      const deviceCode = match[1];   // Extract device_code (e.g., HT_2_3)
      const metricCode = match[2];   // Extract metric_code (e.g., b_temperature)

      // Initialize deviceCode and metricCode in result if not already initialized
      if (!result[deviceCode]) {
        result[deviceCode] = {};
      }
      if (!result[deviceCode][metricCode]) {
        result[deviceCode][metricCode] = [];
      }

      // For each timestamp, add the corresponding value to the result
      timestamps.forEach((timestamp, i) => {
        result[deviceCode][metricCode].push({
          timestamp: timestamp,
          value: values[idx][i] // Corresponding value at the current timestamp
        });
      });
    }
  });

  return result;
}

export function ParseTDEngineData(payload: any, deviceCode: string): DevicesData {
  const devicesData: DevicesData = {};

  // TDEngine的TaosResult数据格式
  if (!payload || !payload._data || !payload._meta) {
    return devicesData;
  }

  const data = payload._data;
  const meta = payload._meta;

  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(meta)) {
    return devicesData;
  }

  // 处理数据行 - TDEngine的last_row(*)查询通常返回一行数据
  for (const row of data) {
    if (!Array.isArray(row) || row.length === 0) {
      continue;
    }

    // 遍历每一列
    for (let i = 0; i < row.length && i < meta.length; i++) {
      const value = row[i];
      const columnMeta = meta[i];

      if (!columnMeta || !columnMeta.name) {
        continue;
      }

      const columnName = columnMeta.name;

      // 处理时间戳列
      if (columnName.includes('ts') || columnName.includes('time')) {
        // 时间戳列，跳过或者可以用作基准时间
        continue;
      }

      // 提取指标代码 - 从 last_row(column_name) 格式中提取 column_name
      let metricCode = columnName;
      const lastRowMatch = columnName.match(/last_row\((.+)\)/);
      if (lastRowMatch) {
        metricCode = lastRowMatch[1];
      }

      // 跳过时间戳相关的列
      if (metricCode === 'ts' || metricCode === 'time') {
        continue;
      }

      if (!devicesData[deviceCode]) {
        devicesData[deviceCode] = {};
      }
      if (!devicesData[deviceCode][metricCode]) {
        devicesData[deviceCode][metricCode] = [];
      }

      // 处理时间戳 - 如果第一列是时间戳，使用它；否则使用当前时间
      let timestamp: number;
      if (i === 0 && (typeof row[0] === 'bigint' || typeof row[0] === 'number')) {
        timestamp = Number(row[0]);
      } else if (row[0] && (typeof row[0] === 'bigint' || typeof row[0] === 'number')) {
        timestamp = Number(row[0]);
      } else {
        timestamp = Date.now();
      }

      // 处理值 - 将BigInt转换为Number，处理NULL值
      let processedValue: any = value;
      if (value === "NULL" || value === null) {
        processedValue = null;
      } else if (typeof value === 'bigint') {
        processedValue = Number(value);
      }

      devicesData[deviceCode][metricCode].push({
        timestamp: timestamp,
        value: processedValue,
      });
    }
  }

  return devicesData;
}

export function ParseLastDeviceData(payload: LastTimeSeriesQueryOutput): DevicesData {
  const { timestamps, values } = payload;
  const devicesData: DevicesData = {};

  // Loop through each metric name in the first sub-array of values
  values[0].forEach((metricFullName, index) => {
    const match = metricFullName.match(/root.*?\.devices\.reports\.(\w+)\.(\w+)/);

    if (match) {
      const deviceCode = match[1];   // Extract device_code (e.g., HT_2_3)
      const metricCode = match[2];   // Extract metric_code (e.g., b_temperature)

      if (!devicesData[deviceCode]) {
        devicesData[deviceCode] = {};
      }
      if (!devicesData[deviceCode][metricCode]) {
        devicesData[deviceCode][metricCode] = [];
      }

      // Create DataPoints with timestamp and parsed value
      const value = values[1][index];
      const dataType = values[2][index];
      const parsedValue = dataType === "FLOAT" ? parseFloat(value) : value;

      const dataPoint: DataPoint = {
        timestamp: timestamps[index],
        value: isNaN(parsedValue as any) ? value : parsedValue,
      };

      // Add the DataPoint to the respective metric in devicesData
      devicesData[deviceCode][metricCode].push(dataPoint);
    }
  });

  return devicesData;
}
