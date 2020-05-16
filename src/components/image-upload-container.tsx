import React, { useRef, FC } from "react";
import firebase, { storage, functions } from "firebase/app";
import ImageUploadComponent, { IComponentProps } from "./image-upload-component";

export interface IProps extends Omit<IComponentProps, "onInputFileChange" | "imageRef" | "onDelete"> {
  fileTypeWhiteList?: MimeType["type"][];
  uploadRefPath: string;
  onUploadSuccess: (snap: firebase.storage.UploadTaskSnapshot) => void;
  onDeleteSuccess?: (snap: firebase.storage.UploadTaskSnapshot) => void;
  previewImageRef?: string;
  onUploadStateChange?: (uploadState: storage.UploadTaskSnapshot) => any;
  noThumbnailGeneration?: boolean;
}

export const ImageUpload: FC<IProps> = ({
  uploadRefPath,
  fileTypeWhiteList,
  onUploadSuccess,
  onDeleteSuccess,
  previewImageRef,
  onUploadStateChange,
  noThumbnailGeneration,
  ...props
}) => {
  const { current: generateThumbnails } = useRef(functions().httpsCallable("generateThumbnails"));
  const allowedFileTypes = fileTypeWhiteList || ["image/png", "image/jpeg"];
  const { current: storageRef } = useRef(firebase.storage().ref());

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    if (!allowedFileTypes.some(kind => file.type === kind)) return;

    const contentType = file.type && file.type.split("/")[1];
    const imagesRef = storageRef.child(uploadRefPath);

    const uploadTask = imagesRef.put(file, contentType ? { contentType } : undefined);
    uploadTask.then(async taskSnapshot => {
      if (!noThumbnailGeneration) {
        await generateThumbnails({ storageRef: uploadRefPath });
      }
      onUploadSuccess(taskSnapshot);
    });
    if (onUploadStateChange) uploadTask.on("state_changed", onUploadStateChange);
  };

  const onDelete = () => {
    if (!previewImageRef) return;
    const confirmed = window.confirm("Delete this image?");
    if (confirmed) {
      storageRef
        .child(previewImageRef)
        .delete()
        .then(onDeleteSuccess);
    }
  };

  return (
    <ImageUploadComponent
      imageRef={previewImageRef}
      onInputFileChange={onUpload}
      onDelete={onDeleteSuccess ? onDelete : undefined}
      {...props}
    />
  );
};

export default ImageUpload;
