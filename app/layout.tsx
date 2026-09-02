import type { Metadata, Viewport } from "next";
import "./globals.css";
import cv from "./cv.json";
import photo from "./photo.jpg";

const base = new URL(cv.basics.url);
const [givenName = "", ...familyParts] = cv.basics.name.split(" ");
const familyName = familyParts.join(" ");
const pageTitle = `${cv.basics.name} - ${cv.basics.label}`;

export const metadata: Metadata = {
  metadataBase: base,
  title: pageTitle,
  description: cv.basics.summary,
  keywords: [cv.basics.name, cv.basics.label, ...cv.skills.flatMap((s) => s.keywords)],
  authors: [{ name: cv.basics.name, url: cv.basics.url }],
  creator: cv.basics.name,
  publisher: cv.basics.name,
  alternates: { canonical: "/" },
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: pageTitle,
    locale: "nl_BE",
    title: pageTitle,
    description: cv.basics.summary,
    firstName: givenName,
    lastName: familyName,
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: cv.basics.summary,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

/* ProfilePage + nested Person (Google's recommended shape for personal
 * profiles): sameAs disambiguates via canonical profiles, image/dateModified
 * are the recommended extras. */
const currentEmployer = cv.work.find((w) => w.endDate === null);
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  inLanguage: "nl-BE",
  dateModified: new Date().toISOString().slice(0, 10),
  mainEntity: {
    "@type": "Person",
    "@id": new URL("#person", base).href,
    name: cv.basics.name,
    givenName,
    familyName,
    jobTitle: cv.basics.label,
    description: cv.basics.summary,
    image: new URL(photo.src, base).href,
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
    ...(currentEmployer && {
      worksFor: { "@type": "Organization", name: currentEmployer.name },
    }),
    alumniOf: cv.education.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.institution,
    })),
    sameAs: cv.basics.profiles.map((p) => p.url),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
