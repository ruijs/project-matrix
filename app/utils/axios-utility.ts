import { Logger } from "@ruiapp/rapid-core";
import { AxiosResponse } from "axios";
import { pick } from "lodash";

export function logAxiosResponse(logger: Logger, level: string, response: AxiosResponse, description?: string) {
  let message = description ? `${description}. %o` : "%o";
  logger.log(level, message, { response: pick(response, ["status", "headers", "data"]) });
}
