import type { Logger } from "@ruiapp/rapid-core";
import * as taos from "@tdengine/websocket";

export default class TDengineAccessor {
  #conn: taos.WsSql | undefined;
  #logger: Logger;

  constructor(logger: Logger) {
    this.#logger = logger;
  }

  async connect() {
    let dsn = "ws://localhost:6041";
    try {
      let conf = new taos.WSConfig(dsn);
      conf.setUser("root");
      conf.setPwd("taosdata");
      conf.setDb("rapid_iot");

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
