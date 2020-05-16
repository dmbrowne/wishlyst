import * as functions from "firebase-functions";
import * as puppeteer from "puppeteer-core";
import * as chromium from "chrome-aws-lambda";

const closePage = async (browser: puppeteer.Browser) => {
  await browser.close();
};

export const getImagesFromUrl = functions.runWith({ memory: "2GB" }).https.onCall(async ({ url }) => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  const close = () => closePage(browser);

  // await page.setRequestInterception(true);
  // const ignore: puppeteer.ResourceType[] = ["image", "stylesheet"];
  // page.on("request", req => (ignore.includes(req.resourceType()) ? req.abort() : req.continue()));
  await page.goto(url, { waitUntil: "networkidle2" });

  try {
    const promises = ["image", "title", "image:type"].map(graphName => {
      return page
        .$eval<string>(`head > meta[name='og:${graphName}']`, (element: Element) => (element as HTMLMetaElement).content)
        .catch(() => void 0);
    });

    const [image, title, mimeType, pageTitle, screenshot] = await Promise.all([
      ...promises,
      page.title(),
      page.screenshot({ encoding: "base64", type: "jpeg", quality: 40 }),
    ]);

    await close();
    return { image, title, mimeType, pageTitle, screenshot };
  } catch (e) {
    await close();
    throw new functions.https.HttpsError("internal", "error fetching open graph images");
  }
});
