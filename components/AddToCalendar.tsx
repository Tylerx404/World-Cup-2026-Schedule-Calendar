"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getBaseUrlClient } from "@/lib/urlClient";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function getWebcalUrl(): string {
  const origin = getBaseUrlClient();
  const host = origin.replace(/^https?:\/\//, "");
  return `webcal://${host}/api/calendar`;
}

function getGoogleCalendarUrl(): string {
  const webcal = getWebcalUrl();
  const https = webcal.replace("webcal://", "https://");
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(https)}`;
}

export function AddToCalendar({ inline = false }: { inline?: boolean } = {}) {
  const t = useTranslations("addToCalendar");
  const [platform, setPlatform] = useState<Platform>("other");
  const [showFallback, setShowFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const webcal = getWebcalUrl();
  const googleUrl = getGoogleCalendarUrl();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function handlePrimaryClick() {
    if (platform === "ios") {
      window.location.href = webcal;
      showToast(t("toasts.openingIos"));
      return;
    }

    if (platform === "android") {
      window.open(googleUrl, "_blank");
      showToast(t("toasts.openingAndroid"));
      return;
    }

    setShowFallback(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(webcal);
      setCopied(true);
      showToast(t("toasts.copied"));
      setTimeout(() => setCopied(false), 1600);
    } catch {
      showToast(t("toasts.copyFailed"));
    }
  }

  function downloadIcs() {
    window.location.href = "/api/calendar?download=1";
  }

  const primaryLabel =
    platform === "ios"
      ? t("primary.ios")
      : platform === "android"
        ? t("primary.android")
        : t("primary.other");

  return (
    <div className={inline ? "" : "relative"}>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handlePrimaryClick} className="button-primary">
          {primaryLabel}
        </button>

        <button onClick={() => setShowFallback(!showFallback)} className="button-secondary">
          {showFallback ? t("secondary.hide") : t("secondary.show")}
        </button>
      </div>

      {showFallback && (
        <div className={inline ? "mt-4 text-sm" : "card-marketing mt-4 text-sm"}>
          <div className="font-medium mb-3">{t("fallbackTitle")}</div>

          <div className="space-y-2.5">
            <button
              onClick={() => {
                window.location.href = webcal;
              }}
              className="w-full text-left px-4 py-3 rounded-md border border-[var(--color-hairline)] hover:bg-[var(--color-canvas-soft)] dark:hover:bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] flex justify-between items-center transition-all duration-150 cursor-pointer"
            >
              <span>{t("options.webcal")}</span>
              <span className="text-[var(--color-link)] text-xs font-medium">{t("options.openNow")}</span>
            </button>

            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-4 py-3 rounded-md border border-[var(--color-hairline)] hover:bg-[var(--color-canvas-soft)] dark:hover:bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] transition-all duration-150 cursor-pointer"
            >
              {t("options.google")}
            </a>

            <button
              onClick={downloadIcs}
              className="w-full text-left px-4 py-3 rounded-md border border-[var(--color-hairline)] hover:bg-[var(--color-canvas-soft)] dark:hover:bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] transition-all duration-150 cursor-pointer"
            >
              {t("options.ics")}
            </button>

            <button
              onClick={copyLink}
              className="w-full text-left px-4 py-3 rounded-md border border-[var(--color-hairline)] hover:bg-[var(--color-canvas-soft)] dark:hover:bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] flex justify-between transition-all duration-150 cursor-pointer"
            >
              <span>{t("options.copyWebcal")}</span>
              <span className="text-[var(--color-link)] text-xs font-medium">{copied ? t("options.copied") : t("options.copy")}</span>
            </button>
          </div>

          <p className="caption mt-4 text-[var(--color-mute)]">
            {t("fallbackNote")}
          </p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#171717] text-white dark:bg-[#ededed] dark:text-[#171717] text-sm px-5 py-2 rounded-full shadow-lg z-[100]">
          {toast}
        </div>
      )}
    </div>
  );
}
