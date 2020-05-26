import { createThumbs, removeThumbs, removeFileFromStorage } from "./utils/images";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const generateThumbnails = functions.runWith({ memory: "1GB" }).https.onCall(async ({ storageRef }) => {
  const storage = admin.storage();
  const file = storage.bucket().file(storageRef);
  const [fileExists] = await file.exists();
  if (!fileExists) return;
  const [meta] = await file.getMetadata();
  console.log("filemeta: ");
  console.log(meta);
  return createThumbs(meta.bucket, meta.name, meta.contentType, meta.metadata);
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
