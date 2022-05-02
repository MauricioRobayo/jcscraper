import { scrapeQuote, removeEnclosingQuotationMarks, cacheDir } from "./utils";

import fs from "fs/promises";
import path from "path";
import { ClickToTweetRef, getClickToTweetRefs } from "./getClickToTweetRefs";
import { filter } from "cheerio/lib/api/traversing";

export interface Quote {
  text: string;
  clickToTweetId: string;
  source: string;
}

export async function getQuotes(): Promise<Quote[]> {
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

    return quotes;
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

      chunk = [];

      const wait = Math.ceil(Math.random() * 5);
      console.log(`Politely waiting ${wait}s...`);
      await new Promise((resolve) => setTimeout(resolve, wait * 1000));
    }

    await fs.writeFile(
      path.join(cacheDir, quotesFilename),
      JSON.stringify(allQuotes)
    );

    return allQuotes;
  }
}

function isQuote(quote: Quote | { error: true }): quote is Quote {
  return !("error" in quote);
}

if (require.main === module) {
  getQuotes();
}
