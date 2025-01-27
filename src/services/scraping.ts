import "@/types/puppeteer";

import { login } from "@/controllers/sunroom/login";
import { HEADLESS } from "@/common/env";
import { getAllListings } from "@/controllers/sunroom/listings";
import { getAvailablePlansByAddress } from "@/controllers/spectrum/internet-plans";
import { IListingPlans } from "@/interfaces/internet-plans";
import puppeteer, { Browser, Page } from "puppeteer";

const customUA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0";

const extraHeaders = {
  "Accept-Language": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36`,
  "User-Agent": `en-US,en;q=0.9`,
  Platform: `Win32`,
};

interface ScrapingPage {
  page: Page;
  inUse: boolean;
}

class ScrapingService {
  declare browser: Browser;

  private MAX_PART_SIZE = 10;

  pages: ScrapingPage[] = [];

  constructor() {}

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: HEADLESS,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

    // Create a new tab for each worker

    for (let i = 0; i < this.MAX_PART_SIZE; i++) {
      const context = await this.browser.createBrowserContext();
      const p = await context.newPage();
      p.setExtraHTTPHeaders(extraHeaders);

      this.pages.push({
        page: p,
        inUse: false,
      });
    }
  }

  searchAvailablePage() {
    const p = this.pages.findIndex((p) => !p.inUse);
    return p;
  }

  async getAllListingsAndPlans(timeout = 60000 * 5) {
    const page = (await this.browser.pages())[0];
    page.setUserAgent(customUA);

    await login(page);

    let listings = await getAllListings(page);
    console.log(listings.length);

    const listingPlans: IListingPlans[] = [];
    const remainingListings = structuredClone(listings).map((p) => ({
      ...p,
      retryCount: 0,
    }));

    let activeScraping = 0;
    let promises: Promise<void>[] = [];

    const startTime = Date.now();

    while (remainingListings.length > 0 && Date.now() - startTime < timeout) {
      if (activeScraping < this.MAX_PART_SIZE) {
        const availableSpaces = Math.abs(this.MAX_PART_SIZE - activeScraping);
        const nextScrapes = remainingListings.splice(-availableSpaces);

        for (const listing of nextScrapes) {
          const pageIdx = this.searchAvailablePage();

          activeScraping++;
          this.pages[pageIdx].inUse = true;

          let promise = getAvailablePlansByAddress(
            this.pages[pageIdx].page,
            listing,
          )
            .then((plans) => {
              this.pages[pageIdx].inUse = false;
              activeScraping--;

              console.log("scrape done", listing.address);
              listingPlans.push({ listing, plans });
            })
            .catch(() => {
              // release worker (page)
              this.pages[pageIdx].inUse = false;
              activeScraping--;

              // Just one retry
              if (listing.retryCount == 0) {
                listing.retryCount++;
                remainingListings.push(listing);
                console.log("retrying", listing.address);
              } else {
                console.log("scrape failed", listing.address);
                listingPlans.push({ listing, plans: [] }); // so, no plans available ?
              }
            });

          promises.push(promise);
        }
      }

      await new Promise((res) => setTimeout(res, 100));
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout scraping ${listings.length} listings`);
    }

    // Ensure all scrapes finished
    await Promise.all(promises);

    return listingPlans;
  }
}

export const scrapingService = new ScrapingService();
