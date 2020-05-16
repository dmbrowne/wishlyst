import * as admin from "firebase-admin";

import { createUserProfile, doesAccountExist, updateAccountProfile, ugradeAnnoymousUser } from "./auth";
import { getImagesFromUrl } from "./puppeteer";
import { generateThumbnails, removeImageAndThumbsOnLystItemDelete, convertToSingleThumb, removeImageThumbsOnRemove } from "./images";
import { deleteAllLystItems, deleteAllAnonymousUsers, removeCategoriesFromLystItem } from "./triggers";

admin.initializeApp();

module.exports = {
  createUserProfile,
  doesAccountExist,
  updateAccountProfile,
  getImagesFromUrl,
  generateThumbnails,
  removeImageAndThumbsOnLystItemDelete,
  convertToSingleThumb,
  ugradeAnnoymousUser,
  removeImageThumbsOnRemove,
  deleteAllLystItems,
  deleteAllAnonymousUsers,
  removeCategoriesFromLystItem,
};
