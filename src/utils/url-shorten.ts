export const shortenUrl = (url: string) => {
  const webApiKey = process.env.REACT_APP_FIREBASE_WEB_API_KEY || "AIzaSyCz2_qBGGYAlsIt07wkm4WSN62XtDCCgf0";
  return fetch("https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" + webApiKey, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      suffix: {
        option: "SHORT",
      },
      dynamicLinkInfo: {
        domainUriPrefix: "https://wishly.st",
        link: url,
      },
    }),
  }).then(res => res.json());
};

export default shortenUrl;
