import { Link } from "@/i18n/navigation";
import { AddToCalendar } from "@/components/AddToCalendar";
import { getWorldCupMatches } from "@/lib/worldcup";
import { getTranslations } from "next-intl/server";
import type { Match } from "@/data/schedule";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { MobileNav } from "@/components/MobileNav";

import { PaginatedSchedule } from "@/components/PaginatedSchedule";

import { Footer } from "@/components/Footer";
import { Logo } from "@/components/icons/Logo";
import { GitHub } from "@/components/icons/GitHub";

export default async function FullSchedulePage() {
  const t = await getTranslations();

  let matches: Match[] = [];
  try {
    matches = await getWorldCupMatches();
  } catch {
    matches = [];
  }

  return (
    <div className="min-h-screen flex flex-col">
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
          <MobileNav calendarHref="/add-to-calendar" />
          <Link href="/add-to-calendar" className="button-primary-sm hidden sm:inline">
            {t("nav.cta.add")}
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <section className="section bg-[var(--color-canvas)] border-b border-[var(--color-hairline)]">
          <div className="container max-w-[1100px]">
            <div className="max-w-[720px]">
              <div className="caption-mono text-[var(--color-wc-gold)] mb-2">{t("schedulePage.headerBadge")}</div>
              <h1 className="display-lg mb-3">{t("schedule.title")}</h1>
              <p className="body-md text-[var(--color-body)]">
                {t("schedule.subtitle")}. {t("schedulePage.webcalDesc")}
              </p>
            </div>
          </div>
        </section>

        <section className="section bg-[var(--color-canvas-soft)]">
          <div className="container max-w-[1100px]">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <div className="caption-mono text-[var(--color-mute)]">{t("schedulePage.matchDetails")}</div>
                <h2 className="display-md">{t("schedulePage.scheduleByRound")}</h2>
              </div>
              <Link href="/add-to-calendar" className="button-secondary-sm hidden md:inline-flex">
                {t("schedulePage.addAllToCalendar")}
              </Link>
            </div>

            <PaginatedSchedule matches={matches} />
          </div>
        </section>

        <section id="add-calendar" className="section container max-w-[1100px]">
          <div className="card-marketing-large border border-[var(--color-wc-gold)]/30 bg-[var(--color-wc-gold-soft)]/30">
            <div className="max-w-[620px]">
              <div className="caption-mono text-[var(--color-wc-gold)] mb-2">{t("schedule.webcal")}</div>
              <h3 className="display-md mb-3">{t("schedulePage.webcalTitle")}</h3>
              <p className="body-md text-[var(--color-body)] mb-6">
                {t("schedulePage.webcalDesc")}
              </p>
              <AddToCalendar />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
