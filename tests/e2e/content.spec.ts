import { expect, test } from "@playwright/test";
import { cvData } from "@/lib/cv/data";
import { pageTitle } from "@/lib/seo/pageTitle";

test.describe("content", () => {
  test("renders the CV from the data model", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(pageTitle);
    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `${cvData.basics.name}, ${cvData.basics.label}`,
    );
    for (const w of cvData.work) {
      await expect(page.getByRole("heading", { level: 3, name: w.position }).first()).toBeVisible();
    }
  });

  test("exposes every section as a named region", async ({ page }) => {
    await page.goto("/");
    const sections = page.locator("section[aria-labelledby]");
    await expect(sections).toHaveCount(7);
    for (const section of await sections.all()) {
      const id = await section.getAttribute("aria-labelledby");
      await expect(section.locator(`h2#${id}`)).toHaveCount(1);
    }
  });

  test("links out to email, phone and profiles", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(`a[href="mailto:${cvData.basics.email}"]`)).toHaveCount(1);
    await expect(page.locator(`a[href="tel:${cvData.basics.phone}"]`)).toHaveCount(1);
    for (const p of cvData.basics.profiles) {
      await expect(page.locator(`a[href="${p.url}"]`)).toHaveCount(1);
    }
  });
});
