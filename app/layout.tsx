import type { Metadata, Viewport } from "next";
import "./globals.css";
import cv from "./cv.json";
import { addressLine } from "./format";

export const metadata: Metadata = {
  title: `CV ${cv.basics.name}`,
  description: cv.basics.summary,
  authors: [{ name: cv.basics.name, url: cv.basics.url }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  inLanguage: "nl-BE",
  mainEntity: {
    "@type": "Person",
    name: cv.basics.name,
    jobTitle: cv.basics.label,
    description: cv.basics.summary,
    address: addressLine(cv.basics.location),
    email: `mailto:${cv.basics.email}`,
    telephone: cv.basics.phone,
    url: cv.basics.url,
    birthDate: cv.basics.birth.date,
    nationality: cv.basics.nationality,
    knowsLanguage: cv.languages.map((l) => l.language),
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
