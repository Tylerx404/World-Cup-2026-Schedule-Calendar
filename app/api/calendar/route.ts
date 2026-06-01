import { NextResponse } from 'next/server';
import { generateIcs } from '@/lib/generateIcs';
import { getWorldCupMatches } from '@/lib/worldcup';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const matches = await getWorldCupMatches();
  const url = new URL(request.url);
  
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") || url.host;
  const baseUrl = `${proto}://${host}`;

  const icsContent = generateIcs(matches, baseUrl);
  const isDownload = url.searchParams.get('download') === '1';

  const headers = new Headers({
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': isDownload
      ? 'attachment; filename="world-cup-2026.ics"'
      : 'inline; filename="world-cup-2026.ics"',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  });

  return new NextResponse(icsContent, { headers });
}
