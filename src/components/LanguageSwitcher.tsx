import { endonym } from "@/lib/i18n/endonym";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

type Props = { current: Locale; label: string };

/** Links to every locale of this page; the current one is marked. Screen only.
 *
 * Each link shows its two-letter code and is named "NL Nederlands": link
 * purpose from the link alone (WCAG 2.4.9), with the visible label opening the
 * accessible name so speech input still reaches it (WCAG 2.5.3). The endonym
 * is an aria-label rather than visually hidden text, because these targets are
 * laid out on their text and hidden text inside them would move the row off
 * the content edge. Each link carries the target language's `lang`, so the
 * endonym is announced in that language's voice. */
export function LanguageSwitcher({ current, label }: Props) {
  return (
    <nav className="lang" aria-label={label}>
      <ul>
        {LOCALES.map((locale) => {
          const code = locale.slice(0, 2).toUpperCase();
          return (
            <li key={locale}>
              <a
                href={`/${locale}`}
                hrefLang={locale}
                lang={locale}
                aria-label={`${code} ${endonym(locale)}`}
                aria-current={locale === current ? "page" : undefined}
              >
                {code}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
