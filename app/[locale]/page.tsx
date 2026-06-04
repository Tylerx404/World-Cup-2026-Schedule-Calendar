import { Link } from "@/i18n/navigation";
import { Countdown } from "@/components/Countdown";
import { MonthCalendar } from "@/components/MonthCalendar";
import { AddToCalendar } from "@/components/AddToCalendar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Hero } from "@/components/Hero";

import { Footer } from "@/components/Footer";
import { Logo } from "@/components/icons/Logo";
import { GitHub } from "@/components/icons/GitHub";

import { getWorldCupMatches } from "@/lib/worldcup";
import { getTranslations } from "next-intl/server";
import { MobileNav } from "@/components/MobileNav";

export default async function WorldCup2026Landing() {
  const dynamicMatches = await getWorldCupMatches();
  const t = await getTranslations();

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
          <MobileNav calendarHref="/add-to-calendar" />
          <Link href="/add-to-calendar" className="button-primary-sm hidden sm:inline">
            {t("nav.cta.add")}
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <Hero matches={dynamicMatches} />

        <section className="section bg-[var(--color-canvas)] border-b border-[var(--color-hairline)]">
          <div className="container max-w-[900px]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-[380px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="caption-mono text-[var(--color-wc-gold)]">{t("schedule.opening.label")}</div>
                </div>
                <div className="body-md-strong text-lg">{t("schedule.opening.datetime")}</div>
                <div className="body-sm text-[var(--color-body)] mt-1">{t("schedule.opening.match")}</div>
              </div>
              <div className="w-full md:w-auto">
                <Countdown />
              </div>
            </div>
          </div>
        </section>

        <section id="schedule" className="section bg-[var(--color-canvas-soft)] border-b border-[var(--color-hairline)]">
          <div className="container max-w-[1100px]">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[var(--color-wc-gold)] mb-1">
                  <span className="caption-mono">WORLD CUP 2026</span>
                </div>
                <h2 className="display-lg">{t("schedule.title")}</h2>
                <p className="text-sm text-[var(--color-body)] mt-1">
                  {t("calendar.monthDesc")}{" "}
                  <Link
                    href="/schedule"
                    className="ml-1 text-[var(--color-wc-gold)] hover:underline whitespace-nowrap font-medium"
                  >
                    {t("calendar.viewFullScheduleLink")}
                  </Link>
                </p>
              </div>
              <Link href="/schedule" className="button-secondary-sm self-start sm:self-auto hover:border-[var(--color-wc-gold)]/60">
                {t("schedule.addAll")}
              </Link>
            </div>

            <MonthCalendar matches={dynamicMatches} />
          </div>
        </section>

        <section id="calendar" className="section bg-[var(--color-canvas)]">
          <div className="container max-w-[1100px]">
            <div className="card-marketing-large border border-[var(--color-wc-gold)]/30 bg-[var(--color-wc-gold-soft)]/30">
              <div className="max-w-[620px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="caption-mono text-[var(--color-wc-gold)]">{t("schedule.webcal")}</div>
                </div>
                <h3 className="display-md mb-3">{t("calendar.title")}</h3>
                <p className="body-md text-[var(--color-body)] mb-6">
                  {t("calendar.description")}
                </p>

                <AddToCalendar />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
