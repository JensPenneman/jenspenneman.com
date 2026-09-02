import { currentEmployer } from "@/lib/cv/currentEmployer";
import { cvData } from "@/lib/cv/data";
import { getLabels } from "@/lib/i18n/getLabels";
import { LOCALES } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/localizedString";
import { siteUrl } from "@/lib/seo/siteUrl";

export const dynamic = "force-static";

/** /llms.txt (llmstxt.org): a Markdown summary of the site for AI agents,
 * generated from the data model. */
export function GET() {
  const { basics } = cvData;
  const employer = currentEmployer(cvData.work);
  const pages = LOCALES.map(
    (locale) =>
      `- [${getLabels(locale).language}: ${t(basics.label, locale)}](${new URL(`/${locale}`, siteUrl).href}): ${t(basics.summary, locale)}`,
  );
  const body = [
    `# ${basics.name}`,
    "",
    `> ${t(basics.summary, "en-GB")}`,
    "",
    `Personal CV of ${basics.name}, ${t(basics.label, "en-GB").toLowerCase()}${employer ? ` at ${employer.name}` : ""}, based in ${basics.location.city}, ${t(basics.location.country, "en-GB")}. The same content is available in four languages; the root URL redirects by Accept-Language.`,
    "",
    "## Pages",
    "",
    ...pages,
    "",
    "## Profiles",
    "",
    ...basics.profiles.map((p) => `- [${p.network}](${p.url})`),
    "",
    "## Optional",
    "",
    `- [Sitemap](${new URL("/sitemap.xml", siteUrl).href})`,
    `- [Contact](mailto:${basics.email}): email`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
