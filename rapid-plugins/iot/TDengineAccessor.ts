import type { Logger } from "@ruiapp/rapid-core";
import * as taos from "@tdengine/websocket";

export interface TDengineAccessorConfig {
  url: string;
  userName: string;
  password: string;
  databaseName: string;
}

export default class TDengineAccessor {
  #conn: taos.WsSql | undefined;
  #logger: Logger;
  #config: TDengineAccessorConfig;

  constructor(logger: Logger, config: TDengineAccessorConfig) {
    this.#logger = logger;
    this.#config = config;
  }

  async connect() {
    const dsn = this.#config.url || "ws://localhost:6041";
    try {
      let conf = new taos.WSConfig(dsn);
      conf.setUser(this.#config.userName || "root");
      conf.setPwd(this.#config.password || "taosdata");
      conf.setDb(this.#config.databaseName || "rapid_iot");

      this.#conn = await taos.sqlConnect(conf);
      this.#logger.info("Connected to " + dsn + " successfully.");
      return this.#conn;
    } catch (err: any) {
      this.#logger.error("Failed to connect to " + dsn + ", ErrCode: " + err.code + ", ErrMessage: " + err.message);
      throw err;
    }
  }

  async disconnect() {
    if (!this.#conn) {
      return;
    }

    await this.#conn.close();
    this.#conn = undefined;
  }

  async exec(sql: string, reqId?: number, action?: string) {
    if (!this.#conn) {
      throw new Error("You should connect to db before execute sql.");
    }

    const result = await this.#conn.exec(sql, reqId, action);
    return result;
  }
}
