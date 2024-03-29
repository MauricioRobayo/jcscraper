import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import { Quotes, quotesSchema, Quote } from "./schema";
import { cacheDir } from "./config";
import { ClickToTweetRef, getClickToTweetRefs } from "./getClickToTweetRefs";
import { QuoteCleaner } from "./QuoteCleaner";

export async function getQuotes(): Promise<Quotes> {
  const quotesFilename = "quotes.json";

  await fs.mkdir(cacheDir, { recursive: true });

  try {
    const cachedQuotes = await fs.readFile(
      path.join(cacheDir, quotesFilename),
      { encoding: "utf-8" }
    );

    const quotes = JSON.parse(cachedQuotes);

    console.log(
      `Found file with previous scraped data. Returning ${quotes.length} cached quotes.`
    );

    return quotesSchema.parse(quotes);
  } catch (e) {
    const allQuotes: Quote[] = [];

    const clickToTweetRefs = await getClickToTweetRefs();
    let chunk: ClickToTweetRef[] = [];
    const chunkSize = 20;

    for (const clickToTweetRef of clickToTweetRefs) {
      chunk.push(clickToTweetRef);

      if (chunk.length >= chunkSize) {
        console.log(`Scraping quotes from ${chunk.length} clickToTweetRefs`);
        const quotes = await Promise.all(
          chunk.map((chunkRef) => scrapeQuote(chunkRef))
        );
        allQuotes.push(...quotes.flat().filter(isQuote));

        chunk = [];

        const wait = Math.ceil(Math.random() * 5);
        console.log(`Politely waiting ${wait}s...`);
        await new Promise((resolve) => setTimeout(resolve, wait * 1000));
      }
    }

    if (chunk.length > 0) {
      console.log(`Scraping quotes from ${chunk.length} clickToTweetRefs`);
      const quotes = await Promise.all(
        chunk.map((chunkRef) => scrapeQuote(chunkRef))
      );
      allQuotes.push(...quotes.flat().filter(isQuote));
    }

    console.log(`=Collected ${allQuotes.length} quotes.\n`);

    await fs.writeFile(
      path.join(cacheDir, quotesFilename),
      JSON.stringify(allQuotes)
    );

    return allQuotes;
  }
}

export async function scrapeQuote(
  clickToTweetRef: ClickToTweetRef
): Promise<Quote | { error: unknown }> {
  try {
    const url = `https://clicktotweet.com/${clickToTweetRef.id}`;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const rawText = $("title").text();

    if (!/\w/.test(rawText)) {
      throw new Error(
        `getQuoteTest: not a quote on cttId '${clickToTweetRef.id}' with text '${rawText}'`
      );
    }

    const quoteCleaner = new QuoteCleaner(rawText);

    return {
      source: clickToTweetRef.source,
      clickToTweetId: clickToTweetRef.id,
      rawText: rawText,
      text: quoteCleaner.clean().text,
    };
  } catch (e) {
    console.log(`Failed on ${JSON.stringify(clickToTweetRef, null, 2)}`);
    return {
      error: e,
    };
  }
}

function isQuote(quote: Quote | { error: unknown }): quote is Quote {
  return !("error" in quote);
}

if (require.main === module) {
  getQuotes();
}
