import * as puppeteer from "puppeteer-core";
import * as chromium from "chrome-aws-lambda";

const pup: { browser: puppeteer.Browser } = {
  browser: (undefined as unknown) as puppeteer.Browser,
};

export default {
  initBrowser: async function startBrowser() {
    pup.browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
  },
  puppeteerBrowser: pup,
};
