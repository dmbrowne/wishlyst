import React, { useState, useRef } from "react";
import { functions, storage, firestore } from "firebase/app";
import { debounce } from "throttle-debounce";
import * as yup from "yup";

import { ILystItem } from "./../store/types";
import asyncCatch from "../utils/async-catch";

interface Props {
  uploadImgPath: string;
  onUpdateLyst: (field: Partial<ILystItem>) => any;
}

interface IUrlData {
  title: string;
  description: string;
  image: string;
  mimeType: string;
  pageTitle: string;
  screenshot: string;
}

const useEditableLystItem = ({ onUpdateLyst, uploadImgPath }: Props) => {
  const { current: getOpenGraphDetails } = useRef(functions().httpsCallable("getImagesFromUrl"));
  const { current: generateThumbnails } = useRef(functions().httpsCallable("generateThumbnails"));
  const [noGraphData, setNoGraphData] = useState(false);
  const [imgUploadPending, setImgUploadPending] = useState(false);
  const [urlGraphFetchPending, setUrlGraphFetchPending] = useState(false);
  const handleUrlChange = (url?: string) => {
    onUpdateLyst({ suggestedNames: null, suggestedImages: null, suggestedDescription: null });
    // prettier-ignore
    yup.string().url().required().validate(url)
        .then(value => getGraphDataFromUrl(value))
        .catch(() => {});
  };

  const getGraphDataFromUrl = async (url: string) => {
    setNoGraphData(false);
    setUrlGraphFetchPending(true);
    const [err, result] = await asyncCatch(getOpenGraphDetails({ url }));
    setUrlGraphFetchPending(false);
    if (err) return setNoGraphData(true);

    const { data } = result as { data: Partial<IUrlData> };
    if (Object.values(data).every(value => !value)) setNoGraphData(true);
    else setNoGraphData(false);

    const { title, description, image, pageTitle, screenshot: base64Ss } = data;
    const screenshot = base64Ss ? firestore.Blob.fromUint8Array(Uint8Array.from(atob(base64Ss), c => c.charCodeAt(0))) : undefined;
    const suggestedNames = [...(title ? [title] : []), ...(pageTitle ? [pageTitle] : [])];
    const suggestedImages = [...(image ? [image] : []), ...(screenshot ? [screenshot as any] : [])];
    onUpdateLyst({ suggestedNames, suggestedImages, suggestedDescription: description });
  };

  const uploadImage = (dataUrl: string, mimeType: string = "image/jpeg", format = "data_url") => {
    setImgUploadPending(true);
    //prettier-ignore
    const uploadTask = storage().ref(uploadImgPath).putString(dataUrl, format, { contentType: mimeType });

    return new Promise<any>(resolve => {
      //prettier-ignore
      uploadTask.on("state_changed", onUploadStateChange, () => setImgUploadPending(false), () => {
        generateThumbnails({ storageRef: uploadImgPath.indexOf("/") === 0 ? uploadImgPath.substring(1) : uploadImgPath }).then(() =>{
          onUploadSuccess(uploadTask.snapshot)
          resolve();
        })
      });
    });
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

  const handleChange = <E extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>>(cb?: (val: string) => any) => async (e: E) => {
    const value = e.target.value;
    onUpdateLyst({ [e.target.name]: value || "" });
    if (cb) cb(value);
  };

  return {
    handleChange,
    resetGraphData: () => setNoGraphData(false),
    noGraphData,
    imgUploadPending,
    urlGraphFetchPending,
    handleUrlChange,
    onUploadStateChange,
    onUploadSuccess,
    uploadImage,
  };
};

export default useEditableLystItem;
