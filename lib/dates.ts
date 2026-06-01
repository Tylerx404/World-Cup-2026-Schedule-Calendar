export function getUserTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }
  return "UTC";
}

export function getDateKeyInTz(isoOrDate: string | Date, timeZone?: string): string {
  const tz = timeZone || getUserTimezone();
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

export function isInPast(iso: string, timeZone?: string): boolean {
  const tz = timeZone || getUserTimezone();
  const matchDate = getDateKeyInTz(iso, tz);
  const today = getDateKeyInTz(new Date(), tz);
  return matchDate < today;
}

export function isToday(iso: string, timeZone?: string): boolean {
  const tz = timeZone || getUserTimezone();
  const matchDate = getDateKeyInTz(iso, tz);
  const today = getDateKeyInTz(new Date(), tz);
  return matchDate === today;
}

export function formatTimeLocal(iso: string, timeZone?: string): string {
  const tz = timeZone || getUserTimezone();
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(d);
}

export function formatDateTimeLocal(iso: string, timeZone?: string): string {
  const tz = timeZone || getUserTimezone();
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(d);
}

const viWeekdaysShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export function getWeekdayShort(iso: string, locale?: string, timeZone?: string): string {
  const tz = timeZone || getUserTimezone();
  const d = new Date(iso);

  if (locale === "vi") {
    const weekdayLong = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: tz,
    }).format(d);

    const map: Record<string, string> = {
      Sunday: "CN",
      Monday: "T2",
      Tuesday: "T3",
      Wednesday: "T4",
      Thursday: "T5",
      Friday: "T6",
      Saturday: "T7",
    };

    return map[weekdayLong] || "T2";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: tz,
  }).format(d);
}

export function formatShortDate(iso: string, locale?: string, timeZone?: string): string {
  const tz = timeZone || getUserTimezone();
  const l = locale === "en" ? "en-US" : "vi-VN";
  const d = new Date(iso);
  return new Intl.DateTimeFormat(l, {
    month: "2-digit",
    day: "2-digit",
    timeZone: tz,
  }).format(d);
}
