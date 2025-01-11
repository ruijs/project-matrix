import { Logger } from "@ruiapp/rapid-core";

export interface ParserResult {
  [key: string]: any;
}

export interface Parser {
  parse(payload: string, clientId?: string): ParserResult;
}

// CRC16 lookup tables
const auchCRCHi = [
  0x00, 0xC1, 0x81, 0x40, 0x01, 0xC0, 0x80, 0x41, 0x01, 0xC0, 0x80, 0x41, 0x00, 0xC1, 0x81,
  0x40
];

const auchCRCLo = [
  0x00, 0xC0, 0xC1, 0x01, 0xC3, 0x03, 0x02, 0xC2, 0xC6, 0x06, 0x07, 0xC7, 0x05, 0xC5, 0xC4,
  0x40
];

function hexToAscii(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

// 添加设备ID映射
export const DEVICE_ID_MAP: Record<string, string> = {
  '020062748395': 'xinZiYuanChongYou1',
  '048071690794': 'xinZiYuanChongYou1',
  '020062733850': 'xinZiYuanChongYou1',
  '048071682353': 'xinZiYuanChongYou1',
  '374064830385': 'xinZiYuanHunHe1',
  '048071687451': 'xinZiYuanHunHe1',
  '551052823440': 'xinZiYuanZaoLi1',
  '713075467134': 'xinZiYuanZaoLi1',
  'F0FE6B000A67': 'xinZiYuanZaoLi1',
  '020062767080': 'huaGuZhuSu1'
};

// 获取所有客户端ID
export const CLIENT_IDS = Object.keys(DEVICE_ID_MAP);

// Temperature Hex Parser implementation
export class TemperatureHexParser implements Parser {
  constructor(private logger: Logger) {}

  private checkCRC16(data: string, expectedCrc: string): boolean {
    let uchCRCHi = 0xFF;
    let uchCRCLo = 0xFF;
    const bytes = Buffer.from(data, 'hex');
    
    for (let i = 0; i < bytes.length; i++) {
      const uIndex = uchCRCLo ^ bytes[i];
      uchCRCLo = uchCRCHi ^ auchCRCHi[uIndex];
      uchCRCHi = auchCRCLo[uIndex];
    }
    
    const calculatedCrc = Buffer.from([uchCRCLo, uchCRCHi]).toString('hex');
    return calculatedCrc === expectedCrc;
  }

  private parseDataSegment(segment: string) {
    if (segment.length !== 18) {
      throw new Error('Invalid segment length');
    }

    const header = segment.slice(0, 6);     // 010304
    const valueHex = segment.slice(6, 14);  // 00000053
    const crc = segment.slice(14, 18);      // ba0e

    const dataToCheck = header + valueHex;
    if (!this.checkCRC16(dataToCheck, crc)) {
      this.logger.warn('CRC check failed for segment:', segment);
    }

    return {
      header,
      value: parseInt(valueHex, 16),
      crc
    };
  }

  parse(payload: string, clientId: string): ParserResult {
    // 分离温度数据和定位数据
    const temperatureData = payload.slice(0, 72);  // 前72个字符是温度数据
    const locationHex = payload.slice(72);         // 剩余的是定位数据

    // 检查温度数据长度
    if (temperatureData.length !== 72) {
      throw new Error(`Invalid temperature data length: ${temperatureData.length}, expected: 72`);
    }

    // 将温度数据分成4段，每段18个字符
    const segments = [
      temperatureData.slice(0, 18),    // 第一段：010304000000 527bce
      temperatureData.slice(18, 36),   // 第二段：010304000000 553a0c
      temperatureData.slice(36, 54),   // 第三段：010304000000 327be6
      temperatureData.slice(54, 72)    // 第四段：010304000000 0a7a34
    ];

    try {
      const [pv, sp, heatHysteresis, coolHysteresis] = segments.map(
        segment => this.parseDataSegment(segment)
      );

      const location = hexToAscii(locationHex);
      const [longitude, latitude] = location.split(',').map(Number);

      // 获取设备ID
      const deviceId = DEVICE_ID_MAP[clientId] || clientId;

      // 格式化输出
      return {
        [deviceId]: [
          {
            ts: Date.now(),
            values: {
              currentTemperature: pv.value,
              setTemperature: sp.value,
              heatHysteresis: heatHysteresis.value,
              coolHysteresis: coolHysteresis.value,
              longitude: longitude,
              latitude: latitude
            }
          }
        ]
      };
    } catch (error) {
      this.logger.error('Error parsing hex data:', error);
      throw error;
    }
  }
}

// Test code
function test() {
  const logger = console as unknown as Logger;
  const parser = new TemperatureHexParser(logger);
  const testClientId = '020062767080'; // 使用一个真实的客户端ID
  
  const testData = '010304000000527bce010304000000553a0c010304000000327be60103040000000a7a343132312e3138383335342c33312e333339383137';
  
  try {
    const result = parser.parse(testData, testClientId);
    console.log('Parsed result:', JSON.stringify(result, null, 2));
    
    // Verify the expected output
    const expected = {
      huaGuZhuSu1: [
        {
          ts: result.huaGuZhuSu1[0].ts, // 使用实际时间戳，因为它是动态的
          values: {
            currentTemperature: 82,
            setTemperature: 85,
            heatHysteresis: 50,
            coolHysteresis: 10,
            longitude: 121.188354,
            latitude: 31.339817
          }
        }
      ]
    };
    
    // 深度比较，忽略时间戳
    const isEqual = JSON.stringify({
      ...result,
      huaGuZhuSu1: [{
        ...result.huaGuZhuSu1[0],
        ts: 0
      }]
    }) === JSON.stringify({
      ...expected,
      huaGuZhuSu1: [{
        ...expected.huaGuZhuSu1[0],
        ts: 0
      }]
    });
    
    console.log('Test passed:', isEqual);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Uncomment to run the test
// ts-node mqtt-server/parsers/index.ts
//test();

// JSON Parser
export class JsonParser implements Parser {
  constructor(private logger: Logger) {}

  parse(payload: string): ParserResult {
    return JSON.parse(payload);
  }
}

// Parser Registry to manage client-parser mappings
export class ParserRegistry {
  private parserMap = new Map<string, Parser>();
  private defaultParser: Parser;
  private hexParserWhitelist: Set<string>;

  constructor(logger: Logger) {
    this.defaultParser = new JsonParser(logger);
    this.hexParserWhitelist = new Set();

    // 直接在构造函数中初始化解析器和白名单
    CLIENT_IDS.forEach(clientId => {
      this.registerParser(clientId, new TemperatureHexParser(logger));
      this.addToWhitelist(clientId);
    });
  }

  registerParser(clientId: string, parser: Parser) {
    this.parserMap.set(clientId, parser);
  }

  addToWhitelist(clientId: string) {
    this.hexParserWhitelist.add(clientId);
  }

  removeFromWhitelist(clientId: string) {
    this.hexParserWhitelist.delete(clientId);
  }

  isInWhitelist(clientId: string): boolean {
    return this.hexParserWhitelist.has(clientId);
  }

  getParser(clientId: string): Parser {
    if (this.isInWhitelist(clientId)) {
      return this.parserMap.get(clientId) || this.defaultParser;
    }
    return this.defaultParser;
  }
}

export class BinaryParser implements Parser {
  constructor(private logger: Logger) {}

  parse(payload: string): ParserResult {
    // 实现二进制数据的解析逻辑
    return {
      // ... parsed data
    };
  }
} 