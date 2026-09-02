import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Jens Penneman",
  description:
    "Full-stack software engineer met 4 jaar ervaring. Dashboards, klantenportalen en koppelingen met externe diensten, van database tot pixel-perfecte interface.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
