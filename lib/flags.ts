import { normalizeTeamName } from "@/data/teams/index";

export function getFlag(team: string): string {
  const normalized = normalizeTeamName(team);
  const map: Record<string, string> = {
    Mexico: "🇲🇽", "South Africa": "🇿🇦", "Korea Republic": "🇰🇷", Czechia: "🇨🇿",
    Canada: "🇨🇦", "Bosnia and Herzegovina": "🇧🇦", "United States": "🇺🇸", Paraguay: "🇵🇾",
    Brazil: "🇧🇷", Morocco: "🇲🇦", Germany: "🇩🇪", "Côte d'Ivoire": "🇨🇮",
    Netherlands: "🇳🇱", Japan: "🇯🇵", Belgium: "🇧🇪", Egypt: "🇪🇬",
    Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", Qatar: "🇶🇦", Australia: "🇦🇺", Algeria: "🇩🇿",
    Argentina: "🇦🇷", Austria: "🇦🇹", "Cape Verde": "🇨🇻", Colombia: "🇨🇴",
    Croatia: "🇭🇷", Curaçao: "🇨🇼", "DR Congo": "🇨🇩", Ecuador: "🇪🇨",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", France: "🇫🇷", Ghana: "🇬🇭", Haiti: "🇭🇹",
    Iran: "🇮🇷", Iraq: "🇮🇶", Jordan: "🇯🇴", "New Zealand": "🇳🇿",
    Norway: "🇳🇴", Panama: "🇵🇦", Portugal: "🇵🇹", "Saudi Arabia": "🇸🇦",
    Senegal: "🇸🇳", Spain: "🇪🇸", Sweden: "🇸🇪", Switzerland: "🇨🇭",
    Tunisia: "🇹🇳", Turkey: "🇹🇷", Uruguay: "🇺🇾", Uzbekistan: "🇺🇿",
    Türkiye: "🇹🇷",
  };
  if (/^Winner Group|^Runner-up Group|^Winner R[0-9]|^Loser SF|^Winner QF|^Winner SF/i.test(normalized)) {
    return "🏆";
  }
  return map[normalized] || "⚽";
}
