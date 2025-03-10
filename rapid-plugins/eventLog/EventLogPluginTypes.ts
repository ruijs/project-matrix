export type EventSourceType = "sys" | "app" | "user";

export type EventLogLevel = "info" | "warn" | "error" | "crit" | "emerg";

export type CreateEventLogInput = {
  time?: string;
  sourceType?: EventSourceType;
  sourceName?: string;
  level?: EventLogLevel;
  message: string;
  eventTypeCode?: string;
  operatorId?: number;
  targetTypeCode?: string;
  targetId?: number;
  targetCode?: string;
  targetName?: string;
  ip?: string;
  details?: string;
  data?: Record<string, any>;
};
