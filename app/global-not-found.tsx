import "@/styles/globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { SpeedInsights } from "@/components/SpeedInsights";
import { WebAnalytics } from "@/components/WebAnalytics";
import { getLabels } from "@/lib/i18n/getLabels";
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/lib/i18n/locales";
import { viewport as seoViewport } from "@/lib/seo/viewport";

export const viewport = seoViewport;

/** The language the URL asked for. This page bypasses app/[locale], so it has
 * no route params: proxy.ts puts the URL's first segment in x-locale (the
 * default locale for a path without one).
 *
 * Reading a header is also what makes the page render per request, and that
 * is load-bearing: prerendered, it would be served from the CDN with the
 * nonces of whichever build produced it, while proxy.ts hands every response
 * a fresh nonce CSP -- and every script on the page would be blocked. Next
 * takes the nonce for the scripts it emits from the request's CSP header. */
async function requestLocale(): Promise<Locale> {
  const locale = (await headers()).get("x-locale") ?? "";
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `404 – ${getLabels(await requestLocale()).notFoundTitle}`,
    robots: { index: false },
  };
}

/** Global 404: bypasses the [locale] layout, so it renders the full document
 * itself and offers every language version. */
export default async function GlobalNotFound() {
  const locale = await requestLocale();
  const labels = getLabels(locale);
  return (
    <html lang={locale}>
      <body>
        <main className="stage">
          <article className="wrap">
            <div className="sheet">
              <section className="row" aria-labelledby="nf">
                {/* the status code labels the row the way a section heading
                    does on the CV, but it is not this page's subject: the
                    title is, and it is the h1 the section is named by */}
                <p>404</p>
                <div className="content">
                  <h1 id="nf">{labels.notFoundTitle}</h1>
                  <p className="intro">{labels.notFoundText}</p>
                  <ul className="back">
                    {LOCALES.map((other) => (
                      <li key={other}>
                        <a href={`/${other}`} hrefLang={other} lang={other}>
                          {getLabels(other).notFoundBack}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </article>
        </main>
        <WebAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
