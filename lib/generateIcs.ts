import type { Match } from '@/data/schedule';
import { getFlag } from '@/lib/flags';

const PRODID = '-//world-cup-2026-schedule-calendar//World Cup 2026 Schedule//EN';
const CALNAME = 'World Cup 2026 - Lịch thi đấu';

function formatIcsDate(isoString: string): string {
  let s = isoString.replace(/[-:]/g, '');
  if (s.endsWith('Z')) s = s.slice(0, -1);
  return s.split('.')[0] + 'Z';
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function buildEvent(match: Match, baseUrl: string): string {
  const dtStart = formatIcsDate(match.datetime);
  const dtEnd = formatIcsDate(
    new Date(new Date(match.datetime).getTime() + 2 * 60 * 60 * 1000).toISOString()
  );

  const flagA = getFlag(match.teamA);
  const flagB = getFlag(match.teamB);
  const summary = `${flagA} ${match.teamA} vs ${flagB} ${match.teamB}${match.group ? ` - Group ${match.group}` : ''}`;
  const location = match.venue;
  
  const host = baseUrl.replace(/^https?:\/\//, "");
  const webcalUrl = `webcal://${host}/api/calendar`;

  const description = [
    'FIFA World Cup 2026',
    match.group ? `Group ${match.group}` : match.stage.replace(/-/g, ' '),
    '',
    location,
    '',
    'Cập nhật tự động: sau vòng bảng, đội knock-out sẽ thay thế "Winner Group X" trong lịch của bạn.',
    'Flags quốc gia có sẵn trong tiêu đề sự kiện.',
    `Nguồn: ${baseUrl} | Subscribe: ${webcalUrl}`,
  ].join('\\n');

  const uid = `wc2026-${match.id}@${host}`;
  const now = formatIcsDate(new Date().toISOString());

  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${baseUrl}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'CATEGORIES:SPORTS,WORLD CUP',
    'END:VEVENT',
  ].join('\r\n');
}

export function generateIcs(matches: Match[], baseUrl?: string): string {
  const finalBaseUrl = baseUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000');
  const events = matches.map(m => buildEvent(m, finalBaseUrl)).join('\r\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${CALNAME}`,
    'X-WR-TIMEZONE:UTC',
    'X-WR-CALDESC:FIFA World Cup 2026 - Lịch thi đấu đầy đủ. Subscribe 1 lần qua WebCal: tự động cập nhật đội knock-out sau vòng bảng + emoji cờ quốc gia trong mỗi trận.',
    events,
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}
