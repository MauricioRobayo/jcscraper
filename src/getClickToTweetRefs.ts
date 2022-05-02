import path from "path";
import fs from "fs/promises";
import { getNewsletterUrls } from "./getNewsletterUrls";
import { cacheDir, scrapeClickToTweetRefs } from "./utils";

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

    await fs.writeFile(
      path.join(cacheDir, clickToTweetRefsFilename),
      JSON.stringify(allClickToTweetRefs)
    );

    return allClickToTweetRefs;
  }
}

if (require.main === module) {
  getClickToTweetRefs();
}
