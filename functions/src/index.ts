import * as admin from "firebase-admin";

import {
  increaseClaimCount,
  updateClaimCount,
  removeBuyersClaimCount,
  addQuickViewBuyerNameAndId,
  updateQuickViewBuyerNameAndId,
  removeQuickViewBuyerNameAndId,
} from "./lyst-items";
import { createUserProfile, updateAccountDisplayName, ugradeAnnoymousUser } from "./auth";
import { getImagesFromUrl } from "./puppeteer";
import { removeImageAndThumbsOnLystItemDelete, removeImageThumbsOnRemove } from "./images";
import { deleteAllLystItems, deleteAllAnonymousUsers, removeCategoriesFromLystItem, deleteAllCategories } from "./triggers";
import { moveAllNestedLystItemsToRoot, fixCategoryData } from "./admin";

admin.initializeApp();

module.exports = {
  createUserProfile,
  updateAccountDisplayName,
  getImagesFromUrl,
  removeImageAndThumbsOnLystItemDelete,
  ugradeAnnoymousUser,
  removeImageThumbsOnRemove,
  deleteAllLystItems,
  deleteAllAnonymousUsers,
  removeCategoriesFromLystItem,
  deleteAllCategories,
  moveAllNestedLystItemsToRoot,
  fixCategoryData,
  increaseClaimCount,
  updateClaimCount,
  removeBuyersClaimCount,
  addQuickViewBuyerNameAndId,
  updateQuickViewBuyerNameAndId,
  removeQuickViewBuyerNameAndId,
};
