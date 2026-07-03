import { NextResponse } from "next/server";
import { WORLDCUP_JSON_URL, mapRawMatchToMatch, type RawMatch } from "@/lib/worldcup";
import { computeStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(WORLDCUP_JSON_URL, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch World Cup data" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { matches?: RawMatch[] };
    const rawMatches = data.matches || [];
    
    const groups = computeStandings(rawMatches);
    const knockoutMatches = rawMatches
      .map((m, index) => mapRawMatchToMatch(m, index))
      .filter((m) => m.stage !== "group");

    return NextResponse.json(
      { groups, knockoutMatches, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Standings and knockout data unavailable", detail: message },
      { status: 500 }
    );
  }
}
