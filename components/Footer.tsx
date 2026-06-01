import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-[var(--color-hairline)] py-12 text-[var(--color-mute)] text-sm">
      <div className="container max-w-[1100px] flex flex-col md:flex-row justify-between gap-4">
        <div>{t("footer.tagline")}</div>
        <div className="flex gap-4">
          <a
            href="https://www.fifa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-ink)] dark:hover:text-white"
          >
            {t("footer.fifa")}
          </a>
          <span>•</span>
          <span>{t("footer.deploy")}</span>
        </div>
      </div>
    </footer>
  );
}
