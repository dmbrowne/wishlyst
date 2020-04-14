import React, { FC, useState, useRef, useEffect } from "react";
import { firestore, functions, storage } from "firebase/app";
import { debounce } from "throttle-debounce";
import * as yup from "yup";

import { ILystItem } from "./../store/types";
import asyncCatch from "../utils/async-catch";

interface Props {
  lystItem: ILystItem;
  uploadImgPath: string;
  onUpdateLyst: (field: { [fieldName: string]: any }) => any;
}

const useEditableLystItem = ({ lystItem, onUpdateLyst, uploadImgPath }: Props) => {
  const { current: getOpenGraphDetails } = useRef(functions().httpsCallable("getImagesFromUrl"));
  const { current: generateThumbnails } = useRef(functions().httpsCallable("generateThumbnails"));
  const [urlGraphData, setUrlGraphData] = useState<Partial<{ title: string; description: string; image: string }>>({});
  const [noGraphData, setNoGraphData] = useState(false);
  const [imgUploadPending, setImgUploadPending] = useState(false);
  const [urlGraphFetchPending, setUrlGraphFetchPending] = useState(false);
  const { current: handleUrlChange } = useRef(
    debounce(1000, (url?: string) => {
      if (!url) return;
      if (lystItem.thumb && lystItem.name && lystItem.description) return;
      // prettier-ignore
      yup.string().url().validate(url).then(value => getGraphDataFromUrl(value));
    })
  );
  const getGraphDataFromUrl = async (url: string) => {
    setUrlGraphFetchPending(true);
    const [err, result] = await asyncCatch(getOpenGraphDetails({ url }));
    setUrlGraphFetchPending(false);
    if (err) {
      setNoGraphData(true);
      return;
    }
    const { data } = result as {
      data: Partial<{ title: string; description: string; image: string; mimeType: string }>;
    };
    const { title, description, image, mimeType } = data;
    if (!title && !description && !image) setNoGraphData(true);
    else setNoGraphData(false);
    setUrlGraphData(mimeType ? { title, description, image } : { title, description });

    if (title && !lystItem.name) onUpdateLyst({ name: title });
    if (description && !lystItem.description) onUpdateLyst({ description });
    const imageMimeTypes = ["image/png", "image/jpeg"];

    if (image && mimeType && imageMimeTypes.includes(mimeType)) {
      getImageFormUrl(image, dataUrl => {
        // prettier-ignore
        const uploadTask = storage().ref(uploadImgPath).putString(dataUrl, 'data_url', { contentType: mimeType });
        uploadTask.on(
          "state_changed",
          onUploadStateChange,
          error => setImgUploadPending(false),
          () => {
            generateThumbnails({ storageRef: uploadImgPath.indexOf("/") === 0 ? uploadImgPath.substring(1) : uploadImgPath }).then(() =>
              onUploadSuccess(uploadTask.snapshot)
            );
          }
        );
      });
    }
  };

  const onUploadStateChange = ({ state }: storage.UploadTaskSnapshot) => {
    if (state === storage.TaskState.RUNNING) {
      setImgUploadPending(true);
    }
  };

  const onUploadSuccess = (snapshot: storage.UploadTaskSnapshot) => {
    setImgUploadPending(false);
    onUpdateLyst({ thumb: snapshot.ref.fullPath });
  };

  const getImageFormUrl = (url: string, callback: (base64: string) => any) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      callback(canvas.toDataURL("image/jpg"));
    };
    img.src = url;
  };

  const handleChange = <E extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>>(cb?: (val: string) => any) => async (e: E) => {
    const value = e.target.value;
    onUpdateLyst({ [e.target.name]: value });
    if (cb) cb(value);
  };

  return {
    handleChange,
    noGraphData,
    imgUploadPending,
    urlGraphFetchPending,
    handleUrlChange,
    onUploadStateChange,
    onUploadSuccess,
  };
};

export default useEditableLystItem;
