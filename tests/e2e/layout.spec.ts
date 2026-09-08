import { expect, test } from "@playwright/test";

/* The geometry the screen design promises, measured on TEXT instead of on
 * element boxes: every hit area on this page is deliberately taller than the
 * text inside it (AAA 2.5.5), so a box says nothing about where a reader
 * actually sees a line of type.
 *
 *  - Every section starts its content on the line of its own label: beside it
 *    where the label sits in the gutter, one uniform gap below it where a
 *    phone stacks the two.
 *  - The rows that carry those hit areas keep them (>= 44px) and keep one
 *    pitch, and so does the language switcher -- a row of controls, not
 *    inline text, so 2.5.5 applies to it in full and its four targets have to
 *    be 44x44 each without overlapping one another.
 *  - A label pins to the top of the viewport for the length of its own
 *    section on screen, and is never sticky in print.
 */

type Layout = {
  /** section label ids, in document order */
  ids: string[];
  /** content's first line minus the label's first line, per section */
  beside: number[];
  /** content's first line minus the label's last line, per section */
  below: number[];
  /** the label is stacked above its content instead of beside it, per section */
  stacked: boolean[];
  links: {
    height: number;
    width: number;
    lineTop: number;
    textLeft: number;
    textRight: number;
  }[];
  /** the gutter `ul.links` puts between two channel links */
  linksGap: number;
  contact: { height: number; lineTop: number }[];
  lang: { width: number; height: number; left: number; right: number; textRight: number }[];
  /** right edge of the sheet, which the switcher has to stay flush with */
  sheetRight: number;
};

/** Runs in the page: `page.evaluate` ships the source, so this is self-contained. */
function measureLayout(): Layout {
  /* A Range reports the font's em box, which the line box centres with its
     half-leading. Adding that back is what makes two lines set at different
     sizes -- a 9pt label and a 12pt entry title -- comparable. */
  const halfLeading = (parent: Element, rect: DOMRect) => {
    const lineHeight = Number.parseFloat(getComputedStyle(parent).lineHeight);
    return Number.isNaN(lineHeight) ? 0 : (lineHeight - rect.height) / 2;
  };
  const textNodes = (root: Element) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
    });
    const nodes: Text[] = [];
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode())
      nodes.push(node as Text);
    return nodes;
  };
  const edge = (node: Text | undefined, side: "top" | "bottom") => {
    const parent = node?.parentElement;
    if (!node || !parent) throw new Error("expected rendered text");
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()];
    const rect = side === "top" ? rects[0] : rects[rects.length - 1];
    if (!rect) throw new Error("expected a client rect for the text");
    const half = halfLeading(parent, rect);
    return Math.round((side === "top" ? rect.top - half : rect.bottom + half) * 100) / 100;
  };
  const firstLine = (root: Element) => edge(textNodes(root)[0], "top");
  const lastLine = (root: Element) => {
    const nodes = textNodes(root);
    return edge(nodes[nodes.length - 1], "bottom");
  };
  const row = (link: Element) => ({
    height: Math.round(link.getBoundingClientRect().height * 100) / 100,
    lineTop: firstLine(link),
  });
  const round2 = (value: number) => Math.round(value * 100) / 100;
  const textBox = (link: Element) => {
    const range = document.createRange();
    range.selectNodeContents(link);
    const rect = range.getBoundingClientRect();
    return { textLeft: round2(rect.left), textRight: round2(rect.right) };
  };

  const round = (value: number) => Math.round(value * 100) / 100;
  const layout: Layout = {
    ids: [],
    beside: [],
    below: [],
    stacked: [],
    links: [],
    contact: [],
    lang: [],
    linksGap: Number.parseFloat(
      getComputedStyle(document.querySelector("ul.links") as Element).columnGap,
    ),
    sheetRight: round(document.querySelector(".sheet")?.getBoundingClientRect().right ?? 0),
  };
  for (const section of document.querySelectorAll("section.row")) {
    const label = section.querySelector("h2");
    const content = section.children[1];
    if (!label || !content) throw new Error("expected a label and a content column");
    const contentTop = firstLine(content);
    layout.ids.push(label.id);
    layout.beside.push(Math.round((contentTop - firstLine(label)) * 100) / 100);
    layout.below.push(Math.round((contentTop - lastLine(label)) * 100) / 100);
    layout.stacked.push(
      content.getBoundingClientRect().top >= label.getBoundingClientRect().bottom - 1,
    );
  }
  for (const link of document.querySelectorAll("ul.links a"))
    layout.links.push({
      ...row(link),
      width: round(link.getBoundingClientRect().width),
      ...textBox(link),
    });
  for (const link of document.querySelectorAll("address.contact a")) layout.contact.push(row(link));
  for (const link of document.querySelectorAll("nav.lang a")) {
    const box = link.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(link);
    layout.lang.push({
      width: round(box.width),
      height: round(box.height),
      left: round(box.left),
      right: round(box.right),
      textRight: round(range.getBoundingClientRect().right),
    });
  }
  return layout;
}

/** Runs in the page: scrolls through the first section, reporting the label's
 *  distance to the top of the viewport at each stop. */
async function pinFirstLabel() {
  const section = document.querySelector("section.row");
  const label = section?.querySelector("h2");
  if (!section || !label) throw new Error("expected a section with a label");
  const settle = () =>
    new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  const at = async (y: number) => {
    window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
    await settle();
    return Math.round(label.getBoundingClientRect().top * 100) / 100;
  };
  const box = section.getBoundingClientRect();
  const top = box.top + window.scrollY;
  const bottom = box.bottom + window.scrollY;
  const style = getComputedStyle(label);
  const measured = {
    position: style.position,
    /* an opaque ground, so content may scroll underneath it */
    transparent: ["transparent", "rgba(0, 0, 0, 0)"].includes(style.backgroundColor),
    documentHeight: document.documentElement.scrollHeight,
    onEnteringSection: await at(top + 1),
    inMidSection: await at((top + bottom) / 2),
    pastSection: await at(bottom + 40),
  };
  window.scrollTo({ top: 0, behavior: "instant" });
  await settle();
  return { ...measured, heightAfterScrolling: document.documentElement.scrollHeight };
}

/* Sub-pixel headroom: the half-leading correction above leaves the engines'
   own rounding of a text rect, measured at 0.9px worst case (Chromium) and
   0.2px (WebKit) across 320-1600px and up to a 200% font size. */
const TOLERANCE = 1;
const spread = (values: number[]) => Math.max(...values) - Math.min(...values);
const pitches = (lineTops: number[]) =>
  lineTops.slice(1).map((top, i) => Math.round((top - (lineTops[i] ?? 0)) * 100) / 100);

test.describe("screen layout", () => {
  test("starts every section on the line of its own label", async ({ page }) => {
    await page.goto("/nl-BE");
    const layout = await page.evaluate(measureLayout);
    expect(layout.ids).toHaveLength(7);
    /* one layout for the whole page: either every label is in the gutter or
       every label is stacked above its content */
    expect(new Set(layout.stacked).size).toBe(1);

    const stacked = layout.stacked[0] === true;
    const gaps = stacked ? layout.below : layout.beside;
    const detail = layout.ids.map((id, i) => `${id}=${gaps[i]}`).join(" ");
    expect(spread(gaps), `expected one gap per section, got ${detail}`).toBeLessThanOrEqual(
      TOLERANCE,
    );
    if (!stacked)
      /* the label sits beside the content: the same LINE, not just the same gap */
      for (const [i, gap] of gaps.entries())
        expect(
          Math.abs(gap),
          `${layout.ids[i]} is off its label's line (${detail})`,
        ).toBeLessThanOrEqual(TOLERANCE);
  });

  test("keeps every channel link tappable and its rows at one pitch", async ({ page }) => {
    await page.goto("/nl-BE");
    const layout = await page.evaluate(measureLayout);
    expect(layout.links).toHaveLength(3);
    for (const [i, link] of layout.links.entries()) {
      expect(link.height, `channel link ${i} target height`).toBeGreaterThanOrEqual(44);
      /* 2.5.5 asks for 44 in BOTH directions, and "GitHub" is a 37px word */
      expect(link.width, `channel link ${i} target width`).toBeGreaterThanOrEqual(44);
    }
    expect(spread(pitches(layout.links.map((l) => l.lineTop)))).toBeLessThanOrEqual(TOLERANCE);

    /* the width comes from padding that is pulled straight back out again, so
       the type has not moved: consecutive labels are still exactly the list's
       own gutter apart, and the first one still starts on the content edge */
    if (layout.stacked[0] !== true)
      for (const [i, link] of layout.links.slice(1).entries()) {
        const gap = Math.round((link.textLeft - (layout.links[i]?.textRight ?? 0)) * 100) / 100;
        expect(
          Math.abs(gap - layout.linksGap),
          `channel links ${i} and ${i + 1} are ${gap}px apart, not ${layout.linksGap}px`,
        ).toBeLessThanOrEqual(TOLERANCE);
      }

    /* phones stack the contact details into rows of their own; wider screens
       set them as one sentence, where 2.5.5 exempts the links inside it */
    expect(layout.contact).toHaveLength(2);
    if (layout.stacked[0] === true)
      for (const [i, link] of layout.contact.entries())
        expect(link.height, `contact link ${i} target height`).toBeGreaterThanOrEqual(44);
    expect(spread(pitches(layout.contact.map((l) => l.lineTop)))).toBeLessThanOrEqual(TOLERANCE);
  });

  test("keeps every language switcher link a 44px target of its own", async ({ page }) => {
    await page.goto("/nl-BE");
    const layout = await page.evaluate(measureLayout);
    expect(layout.lang).toHaveLength(4);
    for (const [i, link] of layout.lang.entries()) {
      expect(link.width, `language link ${i} target width`).toBeGreaterThanOrEqual(44);
      expect(link.height, `language link ${i} target height`).toBeGreaterThanOrEqual(44);
    }
    /* an overlap would hand part of a link's area to its neighbour */
    for (const [i, link] of layout.lang.slice(1).entries())
      expect(link.left, `language links ${i} and ${i + 1} overlap`).toBeGreaterThanOrEqual(
        layout.lang[i]?.right ?? 0,
      );
    /* and the row still ends flush with the content edge */
    const last = layout.lang.at(-1);
    expect(Math.abs((last?.right ?? 0) - layout.sheetRight)).toBeLessThanOrEqual(TOLERANCE);
    if (layout.stacked[0] !== true)
      /* where the code sits at the right of its cell, the letters are on the
         content edge themselves (phones centre them instead) */
      expect(Math.abs((last?.textRight ?? 0) - layout.sheetRight)).toBeLessThanOrEqual(TOLERANCE);
  });

  test("pins a section label for the length of its section", async ({ page }) => {
    await page.goto("/nl-BE");
    const pinned = await page.evaluate(pinFirstLabel);
    expect(pinned.position).toBe("sticky");
    expect(pinned.transparent).toBe(false);
    expect(Math.abs(pinned.onEnteringSection)).toBeLessThanOrEqual(TOLERANCE);
    expect(Math.abs(pinned.inMidSection)).toBeLessThanOrEqual(TOLERANCE);
    /* and then it leaves with its own section */
    expect(pinned.pastSection).toBeLessThan(0);
    /* sticky must not reflow: scrolling changes nothing about the page */
    expect(pinned.heightAfterScrolling).toBe(pinned.documentHeight);
  });

  test("never pins a label, nor hoists the links, in print", async ({ page }) => {
    await page.goto("/nl-BE");
    await page.emulateMedia({ media: "print" });
    const printed = await page.evaluate(() => {
      const label = document.querySelector("section.row > h2");
      const links = document.querySelector("ul.links");
      if (!label || !links) throw new Error("expected a label and the channel list");
      return {
        position: getComputedStyle(label).position,
        scrollPadding: getComputedStyle(document.documentElement).scrollPaddingTop,
        linkMargins: [getComputedStyle(links).marginTop, getComputedStyle(links).marginBottom],
      };
    });
    expect(printed.position).toBe("static");
    expect(printed.scrollPadding).toBe("auto");
    expect(printed.linkMargins).toEqual(["0px", "0px"]);
  });
});
