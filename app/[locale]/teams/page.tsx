import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getAllTeams, type TeamInfo } from "@/data/teams/index";
import type { Match } from "@/data/schedule";
import { getWorldCupMatches } from "@/lib/worldcup";
import { TeamsBrowser } from "@/components/TeamsBrowser";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/icons/Logo";
import { GitHub } from "@/components/icons/GitHub";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "teamsPage" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: {
      languages: {
        vi: "/vi/doi-tuyen",
        en: "/en/teams",
      },
    },
  };
}

export default async function TeamsPage() {
  const t = await getTranslations();
  const tTeams = await getTranslations("teamsPage");

  let matches: Match[] = [];
  try {
    matches = await getWorldCupMatches();
  } catch {
    matches = [];
  }

  const allTeamsForBrowser = getAllTeams().map((t) => ({ ...t, present: true }));

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col">
      <nav className="nav-bar flex items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <Logo className="h-8" />
            <span className="font-semibold tracking-[-0.6px] text-lg flex items-center gap-0.5">
              <span className="text-[var(--color-wc-gold)]">WC26</span>
              <span className="text-[var(--color-ink)] opacity-85 font-normal">Cal</span>
            </span>
          </Link>
          <span className="text-[var(--color-mute)] text-sm hidden lg:inline">{t("nav.hosts")}</span>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1 text-sm">
            <Link href="/schedule" className="nav-link hidden md:inline">
              {t("nav.links.schedule")}
            </Link>
            <Link href="/teams" className="nav-link hidden md:inline">
              {t("nav.links.teams")}
            </Link>
            <Link href="/add-to-calendar" className="nav-link hidden md:inline">
              {t("nav.links.calendar")}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden md:block" />
          <DarkModeToggle className="hidden md:block" />
          <a
            href="https://github.com/Tylerx404/World-Cup-2026-Schedule-Calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full border border-[var(--color-hairline)] text-[var(--color-body)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors hidden md:inline-flex items-center justify-center"
            title="GitHub"
            aria-label="GitHub"
          >
            <GitHub className="w-4 h-4" />
          </a>
          <MobileNav />
          <Link href="/add-to-calendar" className="button-primary-sm hidden sm:inline">
            {t("nav.cta.add")}
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <section className="section bg-[var(--color-canvas)] border-b border-[var(--color-hairline)]">
          <div className="container max-w-[1100px]">
            <div className="max-w-[720px]">
              <div className="caption-mono text-[var(--color-wc-gold)] mb-2">{tTeams("headerBadge")}</div>
              <h1 className="display-lg mb-3">{tTeams("title")}</h1>
              <p className="body-md text-[var(--color-body)]">
                {tTeams("description")}
              </p>
            </div>
          </div>
        </section>

        <section className="section bg-[var(--color-canvas-soft)]">
          <div className="container max-w-[1100px]">
            <TeamsBrowser teams={allTeamsForBrowser} allMatches={matches} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
