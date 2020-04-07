import * as admin from "firebase-admin";

admin.initializeApp();

export { createUserProfileOnAccountCreate, doesAccountExist } from "./auth";
export { getImagesFromUrl } from "./puppeteer";
