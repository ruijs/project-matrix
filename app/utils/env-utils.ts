import { parseBoolean } from "./boolean-utils";

export function getBooleanEnvValue(name: string) {
  const env: any = process.env;
  return parseBoolean(env[name] || "");
}
