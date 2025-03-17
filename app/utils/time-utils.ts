import dayjs from "dayjs";

export function getNowString() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
}

export function getNowStringWithTimezone() {
  return dayjs().format("YYYY-MM-DD HH:mm:ss.SSSZ");
}

/**
 * formatDateTimeWithoutTimezone("2025-02-19 02:00:00.100000 +00:00") // 2025-02-19 10:00:00.000
 * formatDateTimeWithoutTimezone("2025-02-19 04:00:00.100000 +00:00") // 2025-02-19 12:00:00.000
 * formatDateTimeWithoutTimezone("2025-02-19 22:00:00.100000 +00:00") // 2025-02-20 06:00:00.000
 * @param dateTime
 * @returns
 */
export function formatDateTimeWithoutTimezone(dateTime?: string) {
  if (!dateTime) {
    return "";
  }
  return dayjs(dateTime).format("YYYY-MM-DD HH:mm:ss.SSS");
}

export function formatMomentDate(m: any) {
  if (!m) {
    return "";
  }

  return m.format("YYYY-MM-DD");
}

export function formatMomentDateTime(m: any) {
  if (!m) {
    return "";
  }

  return m.format("YYYY-MM-DD HH:mm:ss.SSS");
}
