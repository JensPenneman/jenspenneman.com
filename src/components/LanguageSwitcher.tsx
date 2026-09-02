import { LOCALES, type Locale } from "@/lib/i18n/locales";

type Props = { current: Locale; label: string };

/** Links to every locale of this page; the current one is marked. Screen only. */
export function LanguageSwitcher({ current, label }: Props) {
  return (
    <nav className="lang" aria-label={label}>
      <ul>
        {LOCALES.map((locale) => (
          <li key={locale}>
            <a
              href={`/${locale}`}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === current ? "page" : undefined}
            >
              {locale.slice(0, 2).toUpperCase()}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
