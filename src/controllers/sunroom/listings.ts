import { Page } from "puppeteer";
import { SUNROOM_URLBASE } from "@/common/env";
import { IListing } from "@/interfaces/sunroom/listing.interface";

async function getAllListings(page: Page): Promise<IListing[]> {
  const listingsUrl = `${SUNROOM_URLBASE}/feed/sunroom-listings`;
  await page.goto(listingsUrl, { waitUntil: "networkidle2" });

  const scrollDown = async () => {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );

    const existsLoader = await page.waitForSelectorNullish(
      ".loading-gif",
      1000,
    );
    if (existsLoader !== null) {
      await page.waitUntilDissapers(".loading-gif", 500);
      await scrollDown();
    }
  };

  await scrollDown();

  const data = await page.$$eval(
    "div.SrListviewGrid div.searchLinkContainer ",
    (d) =>
      d.map((div) => {
        const linkParts = div
          .getElementsByTagName("a")[0]
          .getAttribute("href")
          ?.split("/");

        return {
          price: Number(
            div
              .getElementsByClassName("price")[0]
              .innerHTML.trim()
              .replace(/[^0-9.-]+/g, ""),
          ),
          address: div
            .getElementsByClassName("houseAddress")[0]
            .innerHTML.trim(),
          state: linkParts?.[3]!,
          city: linkParts?.[4]?.replace("-", " ")!,
          zipCode: linkParts?.[5]!,
        };
      }),
  );

  return data;
}

export { getAllListings };
