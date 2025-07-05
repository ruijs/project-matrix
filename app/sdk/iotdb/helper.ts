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
  
  // TDEngine的last_row(*)查询返回的数据格式
  if (!payload || !payload.getData) {
    return devicesData;
  }
  
  const data = payload.getData();
  if (!data || !Array.isArray(data) || data.length === 0) {
    return devicesData;
  }
  
  // 获取列信息 - TDEngine返回的列信息通常在getColumns()方法中
  const columns = payload.getColumns ? payload.getColumns() : [];
  
  // 处理数据行 - TDEngine的last_row(*)查询通常返回一行数据
  for (const row of data) {
    if (!Array.isArray(row) || row.length === 0) {
      continue;
    }
    
    // 第一列通常是时间戳
    const timestamp = Number(row[0]);
    
    // 从第二列开始是设备数据
    for (let i = 1; i < row.length; i++) {
      const value = row[i];
      
      // 如果有列信息，使用列名来解析指标代码
      if (columns && columns[i]) {
        const columnName = columns[i];
        
        // 根据TDEngine的表结构，列名通常就是指标代码
        // 跳过时间戳列（通常是'ts'）
        if (columnName === 'ts') {
          continue;
        }
        
        const metricCode = columnName;
        
        if (!devicesData[deviceCode]) {
          devicesData[deviceCode] = {};
        }
        if (!devicesData[deviceCode][metricCode]) {
          devicesData[deviceCode][metricCode] = [];
        }
        
        devicesData[deviceCode][metricCode].push({
          timestamp: timestamp,
          value: value === "NULL" ? null : value,
        });
      }
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
