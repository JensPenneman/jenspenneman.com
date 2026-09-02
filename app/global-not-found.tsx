import "@/styles/globals.css";
import type { Metadata } from "next";
import { getLabels } from "@/lib/i18n/getLabels";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/locales";
import { viewport as seoViewport } from "@/lib/seo/viewport";

export const viewport = seoViewport;

const labels = getLabels(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: `404 - ${labels.notFoundTitle}`,
  robots: { index: false },
};

/** Global 404: bypasses the [locale] layout, so it renders the full document
 * itself and offers every language version. */
export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body>
        <main className="stage">
          <article className="wrap">
            <div className="sheet">
              <section className="row" aria-labelledby="nf">
                <h2 id="nf">404</h2>
                <div className="content">
                  <h1>{labels.notFoundTitle}</h1>
                  <p className="intro">{labels.notFoundText}</p>
                  <ul className="back">
                    {LOCALES.map((locale) => (
                      <li key={locale}>
                        <a href={`/${locale}`} hrefLang={locale} lang={locale}>
                          {getLabels(locale).notFoundBack}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </article>
        </main>
      </body>
    </html>
  );
}
