import { ElementHandle, Page } from "puppeteer";

declare module "puppeteer" {
  interface Page {
    waitForSelectorNullish(
      selector: string,
      timeout?: number,
    ): Promise<ElementHandle<Element> | null>;
    waitUntilDissapers(
      selector: string,
      interval?: number,
      timeout?: number,
    ): Promise<void>;
    clearInput(element: ElementHandle<Element>): void;
  }
}

Page.prototype.waitForSelectorNullish = async function (
  selector: string,
  timeout = 30000,
) {
  const element = await this.waitForSelector(selector, { timeout }).catch(
    () => null,
  );
  return element;
};

Page.prototype.waitUntilDissapers = async function (
  selector: string,
  interval: number = 2000,
  timeout: number = 30000,
) {
  const startTime = Date.now();
  let element = await this.waitForSelectorNullish(selector);

  while (element && Date.now() - startTime < timeout) {
    element = await this.waitForSelectorNullish(selector, interval);
  }

  if (element) {
    throw new Error(`Element still on screen "${selector}"`);
  }
};

Page.prototype.clearInput = async function (element: ElementHandle<Element>) {
  await this.evaluate((input) => {
    if (input instanceof HTMLInputElement) {
      input.value = "";
    }
  }, element);
};
