"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { GitHub } from "@/components/icons/GitHub";

interface MobileNavProps {
  calendarHref?: string;
}

type ThemePreference = "system" | "light" | "dark";
type EffectiveTheme = "light" | "dark";

export function MobileNav({ calendarHref = "/add-to-calendar" }: MobileNavProps) {
  const t = useTranslations("nav");
  const tLang = useTranslations("language");
  const tTheme = useTranslations("theme");
  const locale = useLocale() as "vi" | "en";
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLocale = locale;

  const [themePref, setThemePref] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as ThemePreference | null;
    const initial: ThemePreference = stored ?? "system";
    setThemePref(initial);
    applyTheme(resolveEffective(initial));
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if ((localStorage.getItem("theme") ?? "system") === "system") {
        applyTheme(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  function getSystemTheme(): EffectiveTheme {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function resolveEffective(pref: ThemePreference): EffectiveTheme {
    return pref === "system" ? getSystemTheme() : (pref as EffectiveTheme);
  }

  function applyTheme(effective: EffectiveTheme) {
    const root = document.documentElement;
    if (effective === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const close = () => setOpen(false);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  const switchLocale = (newLocale: "vi" | "en") => {
    if (newLocale === currentLocale) {
      close();
      return;
    }
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(pathname, { locale: newLocale });
    close();
  };

  const selectTheme = (next: ThemePreference) => {
    setThemePref(next);
    const effective = resolveEffective(next);
    applyTheme(effective);

    if (next === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", next);

    close();
  };

  const currentEffective = mounted ? resolveEffective(themePref) : "light";

  const themeOptions: Array<{ value: ThemePreference; label: string; icon: React.ReactNode }> = [
    {
      value: "system",
      label: tTheme("auto"),
      icon: (
        <>
          <rect x="2.75" y="4" width="18.5" height="11" rx="1.5" />
          <path d="M7.5 21.25h9M12 15v6.25" />
        </>
      ),
    },
    {
      value: "light",
      label: tTheme("light"),
      icon: (
        <>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </>
      ),
    },
    {
      value: "dark",
      label: tTheme("dark"),
      icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    },
  ];

  return (
    <div className="relative md:hidden" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu"
        className="p-2 rounded-full border border-[var(--color-hairline)] text-[var(--color-body)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max min-w-[200px] max-w-[calc(100vw-32px)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-xl shadow-lg py-2 z-50 text-sm"
        >
          <div className="px-1">
            <Link
              href="/schedule"
              onClick={close}
              className={`block rounded-md px-3 py-2.5 transition-colors ${isActive("/schedule") ? "font-medium text-[var(--color-ink)] bg-[var(--color-canvas-soft)]" : "text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)]"}`}
            >
              {t("links.schedule")}
            </Link>
            <Link
              href="/teams"
              onClick={close}
              className={`block rounded-md px-3 py-2.5 transition-colors ${isActive("/teams") ? "font-medium text-[var(--color-ink)] bg-[var(--color-canvas-soft)]" : "text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)]"}`}
            >
              {t("links.teams")}
            </Link>
            <Link
              href="/add-to-calendar"
              onClick={close}
              className={`block rounded-md px-3 py-2.5 transition-colors ${isActive("/add-to-calendar") ? "font-medium text-[var(--color-ink)] bg-[var(--color-canvas-soft)]" : "text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)]"}`}
            >
              {t("links.calendar")}
            </Link>
          </div>

          <div className="my-2 border-t border-[var(--color-hairline)] mx-2" />

          <div className="px-3 pb-1 text-[10px] font-medium tracking-[0.5px] text-[var(--color-mute)]">
            {tLang("select")}
          </div>
          <button
            onClick={() => switchLocale("vi")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${currentLocale === "vi" ? "font-medium text-[var(--color-ink)]" : "text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)]"}`}
          >
            <span className="text-base shrink-0">🇻🇳</span>
            <span>{tLang("vi")}</span>
            {currentLocale === "vi" && <span className="ml-auto text-xs">✓</span>}
          </button>
          <button
            onClick={() => switchLocale("en")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${currentLocale === "en" ? "font-medium text-[var(--color-ink)]" : "text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)]"}`}
          >
            <span className="text-base shrink-0">🇺🇸</span>
            <span>{tLang("en")}</span>
            {currentLocale === "en" && <span className="ml-auto text-xs">✓</span>}
          </button>

          <div className="my-2 border-t border-[var(--color-hairline)] mx-2" />

          <div className="px-3 pb-1 text-[10px] font-medium tracking-[0.5px] text-[var(--color-mute)]">
            {tTheme("label")}
          </div>
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => selectTheme(opt.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${themePref === opt.value ? "font-medium text-[var(--color-ink)]" : "text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)]"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={opt.value === "system" ? 1.75 : 2} className="w-4 h-4 shrink-0">
                {opt.icon}
              </svg>
              <span>{opt.label}</span>
              {themePref === opt.value && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}

          <div className="my-2 border-t border-[var(--color-hairline)] mx-2" />

          <a
            href="https://github.com/Tylerx404/World-Cup-2026-Schedule-Calendar"
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)] hover:text-[var(--color-ink)] transition-colors"
          >
            <GitHub className="w-4 h-4 shrink-0" />
            <span>GitHub</span>
          </a>


        </div>
      )}
    </div>
  );
}
