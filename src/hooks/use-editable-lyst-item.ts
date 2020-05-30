import { ILystItemFormFields } from "./../@types/index";
import { useState, useRef, useEffect } from "react";
import { functions, storage, firestore } from "firebase/app";
import { debounce } from "throttle-debounce";

import { isValidUrl } from "./../utils/is-valid-url";
import asyncCatch from "../utils/async-catch";
import usePrevious from "./use-previous";

interface IProps {
  uploadImgPath: string;
  onUpdateLystItem: (field: Partial<ILystItemFormFields>) => any;
  values: ILystItemFormFields;
}

interface IUrlData {
  title: string;
  description: string;
  image: string;
  mimeType: string;
  pageTitle: string;
  screenshot: string;
}

const useEditableLystItem = ({ onUpdateLystItem, uploadImgPath, values }: IProps) => {
  const { current: getOpenGraphDetails } = useRef(functions().httpsCallable("getImagesFromUrl"));
  const [noGraphData, setNoGraphData] = useState(false);
  const [imgUploadPending, setImgUploadPending] = useState(false);
  const [urlGraphFetchPending, setUrlGraphFetchPending] = useState(false);
  const previousUrl = usePrevious(values.url);

  useEffect(() => {
    const throttleFetchUrlData = debounce(1000, () => {
      onUpdateLystItem({ suggestedNames: null, suggestedImages: null });
      if (values.url) getGraphDataFromUrl(values.url);
    });

    if (values.url && previousUrl !== values.url) {
      const validUrl = isValidUrl(values.url);
      if (validUrl) throttleFetchUrlData();
    }

    return throttleFetchUrlData.cancel;
  });

  const getGraphDataFromUrl = async (url: string) => {
    setNoGraphData(false);
    setUrlGraphFetchPending(true);
    const [err, result] = await asyncCatch(getOpenGraphDetails({ url }));
    setUrlGraphFetchPending(false);
    if (err) return setNoGraphData(true);

    const { data } = result as { data: Partial<IUrlData> };
    if (Object.values(data).every(value => !value)) setNoGraphData(true);
    else setNoGraphData(false);

    const { title, image, pageTitle, screenshot: base64Ss } = data;
    const screenshot = base64Ss ? firestore.Blob.fromUint8Array(Uint8Array.from(atob(base64Ss), c => c.charCodeAt(0))) : undefined;
    const suggestedNames = [...(title ? [title] : []), ...(pageTitle ? [pageTitle] : [])];
    const suggestedImages = [...(image ? [image] : []), ...(screenshot ? [screenshot as any] : [])];
    onUpdateLystItem({ suggestedNames, suggestedImages });
  };

  const uploadImage = (dataUrl: string, mimeType: string = "image/jpeg", format = "data_url") => {
    setImgUploadPending(true);
    //prettier-ignore
    const uploadTask = storage().ref(uploadImgPath).putString(dataUrl, format, { contentType: mimeType });
    const onError = () => setImgUploadPending(false);
    const onUploadStateChange = ({ state }: storage.UploadTaskSnapshot) => {
      if (state === storage.TaskState.RUNNING) setImgUploadPending(true);
    };

    return new Promise<void>(resolve => {
      uploadTask.on("state_changed", onUploadStateChange, onError);
      uploadTask.then(async taskSnapshot => {
        const downloadUrl = await taskSnapshot.ref.getDownloadURL();
        onUpdateLystItem({
          image: {
            storageRef: taskSnapshot.ref.fullPath,
            downloadUrl,
          },
        });
        setImgUploadPending(false);
        resolve();
      });
    });
  };

  return {
    noGraphData,
    imgUploadPending,
    urlGraphFetchPending,
    uploadImage,
  };
};

export default useEditableLystItem;
