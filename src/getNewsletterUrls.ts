import axios from "axios";
import fs from "fs/promises";
import * as cheerio from "cheerio";
import path from "path";
import { cacheDir, newsletterBaseUrl } from "./config";

export async function getNewsletterUrls(): Promise<string[]> {
  const newsletterUrlsFilename = "newsletterUrls.json";

  await fs.mkdir(cacheDir, { recursive: true });

  try {
    const cachedNewsletterUrls = await fs.readFile(
      path.join(cacheDir, newsletterUrlsFilename),
      { encoding: "utf-8" }
    );

    const newslettersUrls: string[] = JSON.parse(cachedNewsletterUrls);

    console.log(
      `Found file with previous scraped data. Returning ${newslettersUrls.length} cached newsletters urls.`
    );

    return newslettersUrls;
  } catch (e) {
    console.log(`Scraping newsletters urls from ${newsletterBaseUrl}...`);

    const { data } = await axios.get(newsletterBaseUrl);
    const $ = cheerio.load(data);
    const links = $("a.all-articles__news__post");

    const allNewsletterUrls: string[] = [];
    $(links).each((_, link) => {
      const href = $(link).attr("href");
      if (href) {
        allNewsletterUrls.push(href);
      }
    });

    console.log(`=Collected ${allNewsletterUrls.length} newsletters urls.\n`);

    await fs.writeFile(
      path.join(cacheDir, newsletterUrlsFilename),
      JSON.stringify(allNewsletterUrls)
    );

    return allNewsletterUrls;
  }
}

if (require.main === module) {
  getNewsletterUrls();
}
