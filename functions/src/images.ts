import { createThumbs, removeThumbs, removeFileFromStorage } from "./utils/images";
import * as functions from "firebase-functions";

});

export const removeImageAndThumbsOnLystItemDelete = functions.firestore.document("lysts/{lystId}/lystItems/{itemId}").onDelete(snapshot => {
  const { thumb } = snapshot.data() as { thumb?: string };
  if (!thumb) return;
  return Promise.all([removeThumbs(thumb), removeFileFromStorage(thumb)]);
});

export const removeImageThumbsOnRemove = functions.firestore.document("lysts/{lystId}/lystItems/{itemId}").onUpdate(({ before, after }) => {
  const oldItem = before.data();
  const newItem = after.data();

  if (!oldItem || !newItem) return true;

  if (oldItem.thumb !== newItem.thumb) {
    return Promise.all([removeThumbs(oldItem.thumb), removeFileFromStorage(oldItem.thumb)]);
  }

  return true;
});
