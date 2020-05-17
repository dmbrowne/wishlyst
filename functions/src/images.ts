import { createThumbs, removeThumbs, removeFileFromStorage } from "./utils/images";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as sharp from "sharp";

export const convertToSingleThumb = functions.https.onCall(async ({ storageRef }) => {
  const bucket = admin.storage().bucket();
  const file = bucket.file(storageRef);
  const [fileExists] = await file.exists();

  if (!fileExists) return;

  const [meta] = await file.getMetadata();
  if (!meta.contentType.startsWith("image/")) return;
  if (meta.contentType.startsWith("image/svg+xml")) return;

  const filePath = meta.name;

  const fileName = path.basename(filePath);
  const workingDir = path.join(os.tmpdir(), fileName.substring(0, fileName.lastIndexOf(".")));
  const tempFilePath = path.join(workingDir, fileName);
  const resizedTempFilePath = path.join(workingDir, `1_${fileName}`);
  const metadata = { contentType: meta.contentType, metadata: { resized: true } };
  await fs.ensureDir(workingDir);
  await bucket.file(filePath).download({ destination: tempFilePath });

  await sharp(tempFilePath)
    .resize({ width: 600, withoutEnlargement: true })
    .toFile(resizedTempFilePath);

  await bucket.upload(resizedTempFilePath, { destination: filePath, metadata: metadata });
});

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

  if (!!oldItem.thumb && !newItem.thumb) {
    return Promise.all([removeThumbs(oldItem.thumb), removeFileFromStorage(oldItem.thumb)]);
  }

  return true;
});
