import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getBaseUrlServer } from "@/lib/urlServer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = routing.locales.includes(locale as any) ? locale : routing.defaultLocale;

  const t = await getTranslations({ locale: validLocale, namespace: "metadata" });
  const siteUrl = await getBaseUrlServer();

  return {
    metadataBase: new URL(siteUrl),
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        vi: "/vi",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const validLocale = routing.locales.includes(locale as any)
    ? locale
    : routing.defaultLocale;

  setRequestLocale(validLocale);
  const messages = await getMessages();
  const siteUrl = await getBaseUrlServer();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: "FIFA World Cup 2026",
    description: "Giải vô địch bóng đá thế giới 2026, đồng chủ nhà Canada - Mexico - Hoa Kỳ",
    startDate: "2026-06-11T23:00:00Z",
    endDate: "2026-07-19T23:00:00Z",
    location: {
      "@type": "Place",
      name: "Canada, Mexico & United States",
    },
    organizer: {
      "@type": "Organization",
      name: "FIFA",
    },
    url: siteUrl,
  };

  return (
    <>
      <NextIntlClientProvider locale={validLocale} messages={messages}>
        <div className="relative min-h-screen">
          <div className="fixed top-[-12%] right-[4%] w-[520px] h-[520px] rounded-full bg-[var(--color-wc-gold)]/[0.025] blur-[160px] pointer-events-none -z-10" aria-hidden />
          <div className="fixed bottom-[-18%] left-[6%] w-[460px] h-[460px] rounded-full bg-[var(--color-wc-red)]/[0.02] blur-[140px] pointer-events-none -z-10" aria-hidden />
          <div className="fixed top-[25%] left-[12%] w-[320px] h-[320px] rounded-full bg-[var(--color-wc-blue)]/[0.018] blur-[110px] pointer-events-none -z-10" aria-hidden />

          {children}
        </div>
      </NextIntlClientProvider>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
