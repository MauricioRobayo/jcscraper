import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { ClickToTweetRef } from "./getClickToTweetRefs";
import { Quote } from "./getQuotes";

export const cacheDir = path.join(process.cwd(), ".cache");

export async function scrapeClickToTweetRefs(
  newsletterUrl: string
): Promise<ClickToTweetRef[]> {
  const { data } = await axios.get(newsletterUrl);
  const $ = cheerio.load(data);
  const links = $('a[href^="https://ctt.ac/"]');
  const clickToTweetRefs = new Map<string, ClickToTweetRef>();

  $(links).each(function (_, link) {
    const href = $(link).attr("href");
    if (href) {
      const id = href.replace(/.*\//, "");
      clickToTweetRefs.set(href, {
        id,
        source: newsletterUrl,
      });
    }
  });

  return [...clickToTweetRefs.values()];
}

export async function scrapeQuote(
  clickToTweetRef: ClickToTweetRef
): Promise<Quote | { error: true }> {
  try {
    const url = `https://clicktotweet.com/${clickToTweetRef.id}`;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const text = $("title")
      .text()
      .replace(/[-–]\s*@JamesClear/g, "")
      .trim();

    if (!/\w/.test(text)) {
      throw new Error(
        `getQuoteTest: not a quote on cttId '${clickToTweetRef.id}' with text '${text}'`
      );
    }

    return {
      source: clickToTweetRef.source,
      clickToTweetId: clickToTweetRef.id,
      text,
    };
  } catch (e) {
    console.log(`Failed on ${JSON.stringify(clickToTweetRef, null, 2)}`);
    return {
      error: true,
    };
  }
}

export function removeEnclosingQuotationMarks(text: string): string {
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  if (text.startsWith("“") && text.endsWith("”")) {
    return text.slice(1, -1);
  }
  if (text.startsWith("‘") && text.endsWith("’")) {
    return text.slice(1, -1);
  }
  return text;
}
