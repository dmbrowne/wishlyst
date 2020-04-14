import * as admin from "firebase-admin";

import { createUserProfileOnAccountCreate, doesAccountExist, updateAccountProfile } from "./auth";
import { getImagesFromUrl } from "./puppeteer";
import { generateThumbnails, removeImageAndThumbsOnLystItemDelete } from "./images";

admin.initializeApp();

module.exports = {
  createUserProfileOnAccountCreate,
  doesAccountExist,
  updateAccountProfile,
  getImagesFromUrl,
  generateThumbnails,
  removeImageAndThumbsOnLystItemDelete
};
