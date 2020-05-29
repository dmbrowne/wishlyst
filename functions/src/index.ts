import * as admin from "firebase-admin";

import { createUserProfile, updateAccountDisplayName, ugradeAnnoymousUser } from "./auth";
import { getImagesFromUrl } from "./puppeteer";
import { generateThumbnails, removeImageAndThumbsOnLystItemDelete, removeImageThumbsOnRemove } from "./images";
import { deleteAllLystItems, deleteAllAnonymousUsers, removeCategoriesFromLystItem, deleteAllCategories } from "./triggers";
import { moveAllNestedLystItemsToRoot, fixCategoryData } from "./admin";

admin.initializeApp();

module.exports = {
  createUserProfile,
  updateAccountDisplayName,
  getImagesFromUrl,
  generateThumbnails,
  removeImageAndThumbsOnLystItemDelete,
  ugradeAnnoymousUser,
  removeImageThumbsOnRemove,
  deleteAllLystItems,
  deleteAllAnonymousUsers,
  removeCategoriesFromLystItem,
  deleteAllCategories,
  moveAllNestedLystItemsToRoot,
  fixCategoryData,
};
