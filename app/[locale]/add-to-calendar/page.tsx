import { Link } from "@/i18n/navigation";
import { AddToCalendar } from "@/components/AddToCalendar";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { MobileNav } from "@/components/MobileNav";

import { Footer } from "@/components/Footer";
import { Logo } from "@/components/icons/Logo";
import { GitHub } from "@/components/icons/GitHub";

export default async function AddToCalendarPage() {
  const t = await getTranslations();

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

      <main className="flex-1 flex flex-col justify-center">
        <section className="section bg-[var(--color-canvas)] border-b border-[var(--color-hairline)]">
          <div className="container max-w-[720px]">
            <div className="caption-mono text-[var(--color-wc-gold)] mb-2">WORLD CUP 2026</div>
            <h1 className="display-lg mb-3">{t("addToCalendarPage.title")}</h1>
            <p className="body-md text-[var(--color-body)] mb-2">
              {t("addToCalendarPage.subtitle")}
            </p>
            <p className="body-md text-[var(--color-body)] mb-6">
              {t("addToCalendarPage.description")}
            </p>

            <AddToCalendar inline />
          </div>
        </section>

        <section className="section bg-[var(--color-canvas-soft)] border-b border-[var(--color-hairline)]">
          <div className="container max-w-[720px]">
            <div className="caption-mono text-[var(--color-mute)] mb-2">{t("addToCalendarPage.howItWorks")}</div>
            <ol className="space-y-4 text-[var(--color-body)]">
              <li className="flex gap-3">
                <span className="font-mono text-[var(--color-wc-gold)] w-6">01</span>
                <span>{t("addToCalendarPage.step1")}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[var(--color-wc-gold)] w-6">02</span>
                <span>{t("addToCalendarPage.step2")}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[var(--color-wc-gold)] w-6">03</span>
                <span>{t("addToCalendarPage.step3")}</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-[var(--color-wc-gold)] w-6">04</span>
                <span>{t("addToCalendarPage.step4")}</span>
              </li>
            </ol>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
