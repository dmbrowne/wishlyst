import * as admin from "firebase-admin";

import { claimWishlystItem, increaseClaimedLystItemsCount, decreaseClaimedLystItemsCount } from "./lyst-items";
import { createUserProfile, updateAccountDisplayName, ugradeAnnoymousUser } from "./auth";
import { getImagesFromUrl } from "./puppeteer";
import { generateThumbnails, removeImageAndThumbsOnLystItemDelete, removeImageThumbsOnRemove } from "./images";
import { deleteAllLystItems, deleteAllAnonymousUsers, removeCategoriesFromLystItem, deleteAllCategories } from "./triggers";
import { moveAllNestedLystItemsToRoot, fixCategoryData } from "./admin";

admin.initializeApp();

module.exports = {
  claimWishlystItem,
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
  increaseClaimedLystItemsCount,
  decreaseClaimedLystItemsCount,
  moveAllNestedLystItemsToRoot,
  fixCategoryData,
};
