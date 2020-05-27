import * as functions from "firebase-functions";

let browserStarted = false;

// const closePage = async () => {
//   if (browser) await browser.close();
//   else console.log("Browser not opened, so nothing to close");
//   return true;
// };

export const getImagesFromUrl = functions.runWith({ memory: "2GB" }).https.onCall(async ({ url }) => {
  try {
    const puppeteerBrowser = (await import("./browser")).default;
    if (!browserStarted) {
      await puppeteerBrowser.initBrowser();
      browserStarted = true;
    }

    const res = await fetchImages();
    return res;

    async function fetchImages() {
      const browser = puppeteerBrowser.puppeteerBrowser.browser;
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });

      try {
        const promises = ["image", "title", "image:type"].map(graphName => {
          return page
            .$(`head > meta[name='og:${graphName}']`)
            .then(async element => (element ? await element.evaluate(node => node.getAttribute("content")) : null));
        });

        const [image, title, mimeType, pageTitle, screenshot] = await Promise.all([
          ...promises,
          page.title(),
          page.screenshot({ encoding: "base64", type: "jpeg", quality: 30 }),
        ]);

        return { image, title, mimeType, pageTitle, screenshot };
      } catch (e) {
        throw new functions.https.HttpsError("internal", "error fetching images");
      } finally {
        await page.close();
      }
    }
  } catch (e) {
    throw new functions.https.HttpsError("internal", e.message);
  }
});
