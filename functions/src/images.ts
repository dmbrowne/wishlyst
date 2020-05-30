import { removeFileFromStorage, thumbnailPrefix, resizeOriginalImage } from "./utils/images";
import * as functions from "firebase-functions";

export const resizeImage = functions.storage.object().onFinalize(async snapshot => {
  if (!snapshot.name) return;
  if (snapshot.name.startsWith(thumbnailPrefix)) return;
  if (snapshot.metadata && snapshot.metadata.resized) return;

  try {
    await resizeOriginalImage(snapshot.name, snapshot.contentType);
    return true;
  } catch (e) {
    throw Error(e.message);
  }
});

export const removeImageOnLystItemDelete = functions.firestore.document("lysts/{lystId}/lystItems/{itemId}").onDelete(snapshot => {
  const { thumb } = snapshot.data() as { thumb?: string };
  if (!thumb) return;
  return removeFileFromStorage(thumb);
});

export const removeImageThumbsOnRemove = functions.firestore.document("lysts/{lystId}/lystItems/{itemId}").onUpdate(({ before, after }) => {
  const oldItem = before.data() as any;
  const newItem = after.data() as any;

  if (oldItem.thumb !== newItem.thumb) {
    return removeFileFromStorage(oldItem.thumb);
  }

  return true;
});
