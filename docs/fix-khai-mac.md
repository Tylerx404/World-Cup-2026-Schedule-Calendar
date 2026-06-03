Fix: language switching for "KHAI MẠC" section

What I changed
- Replaced a hardcoded Vietnamese label with the translation key so the UI uses the active locale.

Files modified
- Updated: [app/[locale]/page.tsx](app/[locale]/page.tsx#L1-L240) — changed the opening section label from a literal "KHAI MẠC" to `t("schedule.opening.label")`.

Why
- The label was hardcoded in Vietnamese which prevented the page from showing the English text when switching to `en`.

Notes / next steps
- Consider localizing the date/time line (currently hardcoded) and any other literal strings in this file to improve language parity.
 - Localized the opening datetime string to `schedule.opening.datetime` in both `messages/en.json` and `messages/vi.json` and replaced the hardcoded line in `app/[locale]/page.tsx`.

If you want, I can: localize the datetime line and audit the rest of the page for other hardcoded strings.
