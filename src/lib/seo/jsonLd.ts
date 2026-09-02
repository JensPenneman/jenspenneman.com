import type { ProfilePage, WithContext } from "schema-dts";
import { currentEmployer } from "@/lib/cv/currentEmployer";
import type { CvData } from "@/lib/cv/data";
import type { Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import { familyName, givenName } from "./personName";

/* ProfilePage + nested Person: Google's recommended shape for personal
 * profiles. sameAs disambiguates via canonical profiles; image and
 * dateModified are the recommended extras. The Person @id is shared by all
 * locales: one person, four pages. */
export function buildJsonLd(cv: CvData, locale: Locale, photoUrl: URL, today: Date, base: URL) {
  const employer = currentEmployer(cv.work);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: new URL(`/${locale}`, base).href,
    inLanguage: locale,
    dateModified: today.toISOString().slice(0, 10),
    mainEntity: {
      "@type": "Person",
      "@id": new URL("#person", base).href,
      name: cv.basics.name,
      givenName,
      familyName,
      jobTitle: t(cv.basics.label, locale),
      description: t(cv.basics.summary, locale),
      image: photoUrl.href,
      address: {
        "@type": "PostalAddress",
        streetAddress: cv.basics.location.address,
        postalCode: cv.basics.location.postalCode,
        addressLocality: cv.basics.location.city,
        addressCountry: cv.basics.location.countryCode,
      },
      email: `mailto:${cv.basics.email}`,
      telephone: cv.basics.phone,
      url: cv.basics.url,
      birthDate: cv.basics.birth.date,
      birthPlace: { "@type": "Place", name: cv.basics.birth.place },
      nationality: { "@type": "Country", name: t(cv.basics.nationality, locale) },
      knowsLanguage: cv.languages.map((l) => t(l.language, locale)),
      knowsAbout: cv.skills.flatMap((s) => s.keywords),
      ...(employer && { worksFor: { "@type": "Organization", name: employer.name } }),
      alumniOf: cv.education.map((e) => ({
        "@type": "EducationalOrganization",
        name: e.institution,
      })),
      sameAs: cv.basics.profiles.map((p) => p.url),
    },
  } satisfies WithContext<ProfilePage>;
}
