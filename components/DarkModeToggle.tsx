"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";

type ThemePreference = "system" | "light" | "dark";
type EffectiveTheme = "light" | "dark";

function getSystemTheme(): EffectiveTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredPreference(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return null;
}

function applyTheme(effective: EffectiveTheme) {
  const root = document.documentElement;
  if (effective === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function resolveEffective(preference: ThemePreference): EffectiveTheme {
  if (preference === "system") return getSystemTheme();
  return preference;
}

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className }: DarkModeToggleProps) {
  const t = useTranslations("theme");

  const [preference, setPreference] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeOptions = [
    {
      value: "system" as const,
      label: t("auto"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4">
          <rect x="2.75" y="4" width="18.5" height="11" rx="1.5" />
          <path d="M7.5 21.25h9M12 15v6.25" />
        </svg>
      ),
    },
    {
      value: "light" as const,
      label: t("light"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ),
    },
    {
      value: "dark" as const,
      label: t("dark"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
  ];

  const currentOption = themeOptions.find((o) => o.value === preference)!;
  const effective = resolveEffective(preference);

  useEffect(() => {
    const stored = getStoredPreference();
    const initialPref: ThemePreference = stored ?? "system";
    const initialEffective = resolveEffective(initialPref);

    setPreference(initialPref);
    applyTheme(initialEffective);
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentPref = getStoredPreference() ?? "system";
      if (currentPref === "system") {
        const newEffective: EffectiveTheme = e.matches ? "dark" : "light";
        applyTheme(newEffective);
      }
    };

    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectPreference = (next: ThemePreference) => {
    setPreference(next);
    const nextEffective = resolveEffective(next);

    applyTheme(nextEffective);

    if (next === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", next);
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className || ""}`} ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("label")}
        title={mounted ? currentOption.label : undefined}
        disabled={!mounted}
        suppressHydrationWarning
        className="p-2 rounded-full border border-[var(--color-hairline)] text-[var(--color-body)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink)] transition-colors"
      >
        {mounted ? (
          currentOption.icon
        ) : (
          <span className="block w-4 h-4" />
        )}
      </button>

      {open && mounted && (
        <div className="absolute right-0 mt-2 w-max min-w-[140px] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-md shadow-lg py-1 z-50">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => selectPreference(option.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-[var(--color-canvas-soft-2)] transition-colors ${
                preference === option.value ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-body)]"
              }`}
            >
              <span className="shrink-0">{option.icon}</span>
              <span>{option.label}</span>
              {preference === option.value && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
