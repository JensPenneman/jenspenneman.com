import { currentEmployer } from "@/lib/cv/currentEmployer";
import type { CvData } from "@/lib/cv/data";
import { familyName, givenName } from "./personName";

/* ProfilePage + nested Person: Google's recommended shape for personal
 * profiles. sameAs disambiguates via canonical profiles; image and
 * dateModified are the recommended extras. */
export function buildJsonLd(cv: CvData, photoUrl: URL, today: Date, base: URL) {
  const employer = currentEmployer(cv.work);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    inLanguage: "nl-BE",
    dateModified: today.toISOString().slice(0, 10),
    mainEntity: {
      "@type": "Person",
      "@id": new URL("#person", base).href,
      name: cv.basics.name,
      givenName,
      familyName,
      jobTitle: cv.basics.label,
      description: cv.basics.summary,
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
      nationality: cv.basics.nationality,
      knowsLanguage: cv.languages.map((l) => l.language),
      knowsAbout: cv.skills.flatMap((s) => s.keywords),
      ...(employer && { worksFor: { "@type": "Organization", name: employer.name } }),
      alumniOf: cv.education.map((e) => ({
        "@type": "EducationalOrganization",
        name: e.institution,
      })),
      sameAs: cv.basics.profiles.map((p) => p.url),
    },
  };
}
