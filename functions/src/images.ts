import { ILyst } from "@types";
import { removeFileFromStorage, resizeOriginalImage } from "./utils/images";
import * as functions from "firebase-functions";

export const resizeImage = functions.storage.object().onFinalize(async snapshot => {
  if (!snapshot.name) return;
  if (snapshot.metadata && snapshot.metadata.resized) return;

  try {
    await resizeOriginalImage(snapshot.name, snapshot.contentType);
    return true;
  } catch (e) {
    throw Error(e.message);
  }
});

export const removeImageOnLystItemDelete = functions.firestore.document("lysts/{lystId}/lystItems/{itemId}").onDelete(snapshot => {
  const { image } = snapshot.data() as Omit<ILyst, "id">;
  if (image?.isCustomImage && image?.storageRef) {
    return removeFileFromStorage(image.storageRef);
  }
  return;
});

export const removeImageThumbsOnRemove = functions.firestore.document("lysts/{lystId}/lystItems/{itemId}").onUpdate(({ before, after }) => {
  const oldItem = before.data() as ILyst;
  const newItem = after.data() as ILyst;

  if (oldItem.image?.isCustomImage && !!oldItem.image?.storageRef && oldItem.image !== newItem.image) {
    return removeFileFromStorage(oldItem.image.storageRef);
  }

  return true;
});
