import { labels as deBE } from "./labels/de-BE";
import { labels as enGB } from "./labels/en-GB";
import { labels as frBE } from "./labels/fr-BE";
import { labels as nlBE } from "./labels/nl-BE";
import type { Labels } from "./labelsType";
import type { Locale } from "./locales";

const ALL: Record<Locale, Labels> = { "nl-BE": nlBE, "en-GB": enGB, "fr-BE": frBE, "de-BE": deBE };

export function getLabels(locale: Locale): Labels {
  return ALL[locale];
}
