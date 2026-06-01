import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "always",
  pathnames: {
    "/": {
      vi: "/",
      en: "/",
    },
    "/schedule": {
      vi: "/lich-thi-dau",
      en: "/schedule",
    },
    "/teams": {
      vi: "/doi-tuyen",
      en: "/teams",
    },
    "/add-to-calendar": {
      vi: "/them-lich",
      en: "/add-to-calendar",
    },
  },
});
