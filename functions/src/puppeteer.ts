import * as functions from "firebase-functions";
import * as puppeteer from "puppeteer-core";
import * as chromium from "chrome-aws-lambda";

const closePage = async (browser: puppeteer.Browser) => {
  await browser.close();
};

export const getImagesFromUrl = functions.runWith({ memory: "1GB" }).https.onCall(async ({ url }) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless
  });
  const page = await browser.newPage();
  const close = () => closePage(browser);

  await page.setRequestInterception(true);
  const ignore: puppeteer.ResourceType[] = ["image", "stylesheet"];
  page.on("request", req => (ignore.includes(req.resourceType()) ? req.abort() : req.continue()));
  await page.goto(url, { waitUntil: "networkidle2" });

  try {
    const [image, title, description, mimeType] = await Promise.all(
      ["image", "title", "description", "image:type"].map(graphName => {
        return page.$eval<string>(`head > meta[name='og:${graphName}']`, (element: Element) => (element as HTMLMetaElement).content);
      })
    );
    await close();
    return { image, title, description, mimeType };
  } catch (e) {
    await close();
    throw new functions.https.HttpsError("internal", "error fetching open graph images");
  }
});
