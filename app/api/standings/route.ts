import { NextResponse } from "next/server";
import { WORLDCUP_JSON_URL } from "@/lib/worldcup";
import { computeStandings, type RawMatchForStandings } from "@/lib/standings";

export const dynamic = "force-dynamic";

interface RawWorldcupResponse {
  matches?: RawMatchForStandings[];
}

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

    const data = (await res.json()) as RawWorldcupResponse;
    const groups = computeStandings(data.matches || []);

    return NextResponse.json(
      { groups, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, max-age=30, s-maxage=60",
        },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Standings unavailable", detail: message },
      { status: 500 }
    );
  }
}
