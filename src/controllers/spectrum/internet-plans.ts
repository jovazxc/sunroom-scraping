import { SPECTRUM_URLBASE } from "@/common/env";
import { IListing } from "@/interfaces/sunroom/listing.interface";
import { IInternetPlan } from "@/interfaces/internet-plans";
import { Page } from "puppeteer";

const sel = {
  stInput: 'input[placeholder="Street address"]',
  zipCode: 'input[placeholder="Zip Code"]',
  checkBtn: "button.check-availability-btn",
  container: "app-bf-internet-plans div.los-cards-container",
  card: "app-los-card",

  name: ".los-card__content__header-title__name",
  price: ".los-card__content__price__value__dollars",
  speed: ".los-card__content__header-title__speed",
};

export async function getAvailablePlansByAddress(
  page: Page,
  listing: IListing,
): Promise<IInternetPlan[]> {
  try {
    const plansUrl = `${SPECTRUM_URLBASE}/internet/plans`;
    await page.goto(plansUrl, { waitUntil: "networkidle2" });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0",
    );

    // Evitar que el navegador se detecte como "automatizado"
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
    });

    const streetInput = await page.waitForSelectorNullish(sel.stInput, 5000);
    const zipCode = await page.waitForSelectorNullish(sel.zipCode, 5000);
    const checkBtn = await page.waitForSelectorNullish(sel.checkBtn, 2000);

    const body = await page.$("body");
    await page.screenshot({
      path: "screenshot.png",
    });
    if (!streetInput || !zipCode || !checkBtn) {
      throw new Error("Unable to search page element");
    }

    await page.clearInput(streetInput!);
    await streetInput?.type(listing.address);

    await page.clearInput(zipCode!);
    await zipCode?.type(listing.zipCode);

    await checkBtn?.click();
    await page.waitForNavigation();

    const container = await page.waitForSelectorNullish(sel.container, 4000);
    if (!container) {
      return [];
    }

    const plans = await container.$$eval(
      sel.card,
      (cards, sel) =>
        cards.map((card) => {
          const nameElement = card.querySelector(sel.name);
          const priceElement = card.querySelector(sel.price);
          const speedElement = card.querySelector(sel.speed);

          return {
            name: nameElement ? nameElement.innerHTML.trim() : "",
            price: priceElement ? Number(priceElement.innerHTML.trim()) : NaN,
            speed: speedElement ? speedElement.innerHTML.trim() : "",
          };
        }),
      sel,
    );

    return plans;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to scrape");
  }
}
