import * as admin from "firebase-admin";
import * as path from "path";
import * as os from "os";
import * as fs from "fs-extra";
import * as sharp from "sharp";

const getTempFilename = (filePath: string) => (tempName?: string) => {
  const fileName = path.basename(filePath);
  const workingDir = path.join(os.tmpdir(), fileName.substring(0, fileName.lastIndexOf(".")));
  return path.join(workingDir, tempName || fileName);
};

export const resizeOriginalImage = async (filePath: string, contentType: string = "image/jpeg", bucketName?: string) => {
  const fileName = path.basename(filePath);
  const genTempName = getTempFilename(filePath);
  const bucket = admin.storage().bucket(bucketName);
  const tempFilePath = genTempName();
  const resizedTempFilePath = genTempName(`1_${fileName}`);
  const metadata = { contentType: contentType, metadata: { resized: true } };

  await sharp(tempFilePath)
    .resize({ width: 800, fit: "contain", withoutEnlargement: true })
    .toFile(resizedTempFilePath);
  await bucket.upload(resizedTempFilePath, { destination: filePath, metadata: metadata });
  await fs.unlink(resizedTempFilePath);
  return true;
};

export const removeFileFromStorage = async (filePath: string) => {
  // prettier-ignore
  const file = admin.storage().bucket().file(filePath);
  const [fileExists] = await file.exists();
  if (!fileExists) return;
  await file.delete();
  return true;
};
