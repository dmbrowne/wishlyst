import React, { useRef, FC, ReactNode, useState } from "react";
import firebase, { storage, functions } from "firebase/app";
import { EFetchStatus } from "../@types";

// export interface IProps extends Omit<IComponentProps, "onInputFileChange" | "imageRef" | "onDelete"> {
type RenderPropArgs = {
  uploadPending: boolean;
  name: string;
  uploadStatus: keyof typeof EFetchStatus;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
};

export interface IProps {
  name: string;
  uploadRefPath: string;
  previewImageRef?: string;
  shouldGenerateThumbnail?: boolean;
  fileTypeWhiteList?: MimeType["type"][];
  onUploadSuccess?: (snap: firebase.storage.UploadTaskSnapshot) => void;
  onDeleteSuccess?: (snap: firebase.storage.UploadTaskSnapshot) => void;
  onUploadStateChange?: (uploadState: storage.UploadTaskSnapshot) => any;
  children: (props: RenderPropArgs) => ReactNode;
}

export const ImageUpload: FC<IProps> = ({ children, ...props }) => {
  const { uploadRefPath, onUploadSuccess, onDeleteSuccess, previewImageRef, onUploadStateChange, shouldGenerateThumbnail } = props;
  const { current: generateThumbnails } = useRef(functions().httpsCallable("generateThumbnails"));
  const allowedFileTypes = props.fileTypeWhiteList || ["image/png", "image/jpeg"];
  const { current: storageRef } = useRef(firebase.storage().ref());
  const [uploadStatus, setUploadStatus] = useState(EFetchStatus.initial);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    if (!allowedFileTypes.some(kind => file.type === kind)) return;

    const contentType = file.type && file.type.split("/")[1];
    const imagesRef = storageRef.child(uploadRefPath);

    const uploadTask = imagesRef.put(file, contentType ? { contentType } : undefined);

    if (onUploadStateChange)
      uploadTask.on("state_changed", taskSnapshot => {
        onUploadStateChange(taskSnapshot);
        if (taskSnapshot.state === firebase.storage.TaskState.RUNNING) setUploadStatus(EFetchStatus.pending);
        if (taskSnapshot.state === firebase.storage.TaskState.ERROR) setUploadStatus(EFetchStatus.error);
        if (taskSnapshot.state === firebase.storage.TaskState.CANCELED) setUploadStatus(EFetchStatus.initial);
      });

    uploadTask.then(async taskSnapshot => {
      if (shouldGenerateThumbnail) await generateThumbnails({ storageRef: uploadRefPath });
      setUploadStatus(EFetchStatus.success);
      if (onUploadSuccess) onUploadSuccess(taskSnapshot);
    });
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

  return <>{children({ name: props.name, onUpload, onDelete, uploadStatus, uploadPending: uploadStatus === EFetchStatus.pending })}</>;
};

export default ImageUpload;
