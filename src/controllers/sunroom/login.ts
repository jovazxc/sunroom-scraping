import { Page } from "puppeteer";
import {
  SUNROOM_USERNAME,
  SUNROOM_PASSWORD,
  SUNROOM_URLBASE,
} from "@/common/env";

async function login(page: Page) {
  const loginPage = `${SUNROOM_URLBASE}/login`;
  await page.goto(loginPage, { waitUntil: "networkidle2" });

  const tel = await page.waitForSelectorNullish(
    'div.loginFormContainer > form > input[type="tel"]',
    2000,
  );
  const pwd = await page.waitForSelectorNullish(
    'div.loginFormContainer > form > input[type="password"]',
    2000,
  );
  const submit = await page.waitForSelectorNullish(
    "div.loginFormContainer > form > button",
    2000,
  );

  if (!tel) {
    throw new Error("Phone number field not found");
  }

  if (!pwd) {
    throw new Error("Password field not found");
  }

  if (!submit) {
    throw new Error("Login button not found");
  }

  await tel.type(SUNROOM_USERNAME);
  await pwd.type(SUNROOM_PASSWORD);
  await submit.click();
}

export { login };
