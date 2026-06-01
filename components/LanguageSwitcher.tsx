"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const t = useTranslations("language");
  const locale = useLocale() as "vi" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const locales = [
    { code: "vi" as const, label: t("vi"), flag: "🇻🇳" },
    { code: "en" as const, label: t("en"), flag: "🇺🇸" },
  ];

  const current = locales.find((l) => l.code === locale)!;

  const switchLocale = (newLocale: "vi" | "en") => {
    if (newLocale === locale) {
      setOpen(false);
      return;
    }
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.push(pathname, { locale: newLocale });
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className={`relative ${className || ""}`} ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="p-2 rounded-full border border-[var(--color-hairline)] hover:border-[var(--color-ink)] text-[var(--color-body)] hover:text-[var(--color-ink)] transition-colors"
        title={t("select")}
      >
        <span className="text-lg leading-none">{current.flag}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-max min-w-[120px] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-md shadow-lg py-1 z-50">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-[var(--color-canvas-soft-2)] transition-colors ${
                locale === l.code ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-body)]"
              }`}
            >
              <span className="text-base shrink-0">{l.flag}</span>
              <span>{l.label}</span>
              {locale === l.code && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
