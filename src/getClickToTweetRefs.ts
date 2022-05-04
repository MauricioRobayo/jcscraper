import path from "path";
import fs from "fs/promises";
import { getNewsletterUrls } from "./getNewsletterUrls";
import { cacheDir } from "./utils";
import axios from "axios";
import * as cheerio from "cheerio";

export interface ClickToTweetRef {
  id: string;
  source: string;
}

export async function getClickToTweetRefs(): Promise<ClickToTweetRef[]> {
  const clickToTweetRefsFilename = "clickToTweetRefs.json";

  await fs.mkdir(cacheDir, { recursive: true });

  try {
    const cachedClickToTweetRefs = await fs.readFile(
      path.join(cacheDir, clickToTweetRefsFilename),
      {
        encoding: "utf-8",
      }
    );
    const clickToTweetRefs = JSON.parse(cachedClickToTweetRefs);

    console.log(
      `Found file with previous scraped data. Returning ${clickToTweetRefs.length} cached clickToTweetRefs.`
    );

    return clickToTweetRefs;
  } catch (e) {
    const allClickToTweetRefs: ClickToTweetRef[] = [];
    const newsletterUrls = await getNewsletterUrls();

    let chunk: string[] = [];
    const chunkSize = 20;

    for (const newsletterUrl of newsletterUrls) {
      chunk.push(newsletterUrl);

      if (chunk.length >= chunkSize) {
        console.log(
          `Scrapping clickToTweetRefs from ${chunk.length} newsletters`
        );
        const clickToTweetRefs = await Promise.all(
          chunk.map((val) => scrapeClickToTweetRefs(val))
        );
        allClickToTweetRefs.push(...clickToTweetRefs.flat());
        chunk = [];

        const wait = Math.ceil(Math.random() * 5);
        console.log(`Politely waiting ${wait}s...`);
        await new Promise((resolve) => setTimeout(resolve, wait * 1000));
      }
    }

    if (chunk.length > 0) {
      console.log(
        `Scrapping clickToTweetRefs from ${chunk.length} newsletters`
      );
      const clickToTweetRefs = await Promise.all(
        chunk.map((val) => scrapeClickToTweetRefs(val))
      );
      allClickToTweetRefs.push(...clickToTweetRefs.flat());
    }

    console.log(`=Collected ${allClickToTweetRefs.length} clickToTweetRefs.\n`);

    await fs.writeFile(
      path.join(cacheDir, clickToTweetRefsFilename),
      JSON.stringify(allClickToTweetRefs)
    );

    return allClickToTweetRefs;
  }
}

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

if (require.main === module) {
  getClickToTweetRefs();
}
