import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as sharp from "sharp";

const sizes = [64, 128, 256, 400];
const genSizeFileName = (size: number, fileName: string) => {
  return `thumb@${size}_${fileName}`;
};

const createThumbs = async (fileBucket: string, filePath: string, contentType: string, fileMetadata: { [key: string]: any }) => {
  const fileName = path.basename(filePath);

  // Exit if this is triggered on a file that is not an image.
  if (!contentType.startsWith("image/")) return;
  // Exit if the image is already a thumbnail.
  if (fileName.startsWith("thumb@")) return;
  // Exit if already resized
  if (fileMetadata.resized) return;

  // Download file from bucket.
  const bucket = admin.storage().bucket(fileBucket);
  const workingDir = path.join(os.tmpdir(), fileName.substring(0, fileName.lastIndexOf(".")));
  const tempFilePath = path.join(workingDir, fileName);
  const resizedTempFilePath = path.join(workingDir, `1_${fileName}`);
  const metadata = { contentType: contentType, metadata: { resized: true } };
  await fs.ensureDir(workingDir);
  await bucket.file(filePath).download({ destination: tempFilePath });
  console.log("Image downloaded locally to", tempFilePath);

  const uploadPromises = sizes.map(async size => {
    const thumbName = genSizeFileName(size, fileName);
    const thumbFileName = path.join(workingDir, thumbName);
    const saveLocation = path.join(path.dirname(filePath), thumbName);
    // Resize source image
    await sharp(tempFilePath)
      .resize(size, size)
      .toFile(thumbFileName);

    // Upload to GCS
    return bucket.upload(thumbFileName, { destination: saveLocation, metadata: metadata });
  });

  const resizeDefaultImage = async () => {
    await sharp(tempFilePath)
      .resize({ width: 1200 })
      .toFile(resizedTempFilePath);
    return bucket.upload(resizedTempFilePath, { destination: filePath, metadata: metadata });
  };

  await Promise.all([...uploadPromises, resizeDefaultImage()]);

  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  // fs.removeSync(workingDir);

  return filePath;
};

export const autoGenerateThumbnails = functions.storage.object().onFinalize(async object => {
  const fileBucket = object.bucket; // The Storage bucket that contains the file.
  const filePath = object.name || "image"; // File path in the bucket.
  const contentType = object.contentType || ""; // File content type.
  const fileMetadata = object.metadata || {};
  return createThumbs(fileBucket, filePath, contentType, fileMetadata);
});

export const generateThumbnails = functions.https.onCall(async ({ storageRef }) => {
  const storage = admin.storage();
  const file = storage.bucket().file(storageRef);
  const [fileExists] = await file.exists();
  if (!fileExists) return;
  const [meta] = await file.getMetadata();
  console.log("filemeta: ");
  console.log(meta);
  return createThumbs(meta.bucket, meta.name, meta.contentType, meta.metadata);
});

export const removeImageAndThumbsOnLystItemDelete = functions.firestore.document("lysts/{lystId}/lystItem/{itemId}").onDelete(snapshot => {
  const { thumb } = snapshot.data() as { thumb?: string };
  if (!thumb) return;
  const storage = admin.storage();
  const bucket = storage.bucket();
  const fileName = path.basename(thumb);

  const sizeDeletionPromises = sizes.map(async size => {
    const thumbnail = bucket.file(genSizeFileName(size, fileName));
    const [fileExists] = await thumbnail.exists();
    if (!fileExists) return;
    await thumbnail.delete();
    return true;
  });

  const deleteMainFile = async () => {
    const file = bucket.file(thumb);
    const [fileExists] = await file.exists();
    if (!fileExists) return;
    await file.delete();
    return true;
  };

  return Promise.all([...sizeDeletionPromises, deleteMainFile()]);
});
