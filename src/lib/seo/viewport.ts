import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* Paint to the physical screen edges instead of inside a letterbox, so a
   * notched phone shows the page background behind the notch and the home
   * indicator rather than two bars. platform.css pads <body> with the
   * safe-area insets so no content lands underneath them. maximumScale and
   * userScalable are deliberately left alone: pinch zoom stays available. */
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121316" },
  ],
};
