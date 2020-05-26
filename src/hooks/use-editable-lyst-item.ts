import { useState, useRef, useEffect } from "react";
import { functions, storage, firestore } from "firebase/app";
import { debounce } from "throttle-debounce";

import { LystItemFormFields } from "./../components/editable-lyst-item-modal";
import { isValidUrl } from "./../utils/is-valid-url";
import asyncCatch from "../utils/async-catch";
import usePrevious from "./use-previous";

interface IProps {
  uploadImgPath: string;
  onUpdateLystItem: (field: Partial<LystItemFormFields>) => any;
  values: LystItemFormFields;
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
  const { current: generateThumbnails } = useRef(functions().httpsCallable("generateThumbnails"));
  const [noGraphData, setNoGraphData] = useState(false);
  const [imgUploadPending, setImgUploadPending] = useState(false);
  const [urlGraphFetchPending, setUrlGraphFetchPending] = useState(false);
  const previousUrl = usePrevious(values.url);

  useEffect(() => {
    const throttleFetchUrlData = debounce(1000, () => {
      onUpdateLystItem({ suggestedNames: null, suggestedImages: null, suggestedDescription: null });
      getGraphDataFromUrl(values.url);
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

    const { title, description, image, pageTitle, screenshot: base64Ss } = data;
    const screenshot = base64Ss ? firestore.Blob.fromUint8Array(Uint8Array.from(atob(base64Ss), c => c.charCodeAt(0))) : undefined;
    const suggestedNames = [...(title ? [title] : []), ...(pageTitle ? [pageTitle] : [])];
    const suggestedImages = [...(image ? [image] : []), ...(screenshot ? [screenshot as any] : [])];
    onUpdateLystItem({ suggestedNames, suggestedImages, suggestedDescription: description });
  };

  const uploadImage = (dataUrl: string, mimeType: string = "image/jpeg", format = "data_url") => {
    setImgUploadPending(true);
    //prettier-ignore
    const uploadTask = storage().ref(uploadImgPath).putString(dataUrl, format, { contentType: mimeType });
    const onError = () => setImgUploadPending(false);
    const createThumbnails = () => {
      const storageRef = uploadImgPath.indexOf("/") === 0 ? uploadImgPath.substring(1) : uploadImgPath;
      return generateThumbnails({ storageRef });
    };
    const onUploadStateChange = ({ state }: storage.UploadTaskSnapshot) => {
      if (state === storage.TaskState.RUNNING) setImgUploadPending(true);
    };

    return new Promise<void>(resolve => {
      uploadTask.on("state_changed", onUploadStateChange, onError);
      uploadTask.then(async taskSnapshot => {
        await createThumbnails();
        onUpdateLystItem({ thumb: taskSnapshot.ref.fullPath });
        setImgUploadPending(false);
        resolve();
      });
    });
  };

  // const handleChange = <E extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>>(cb?: (val: string) => any) => async (e: E) => {
  //   const value = e.target.value;
  //   onUpdateLystItem({ [e.target.name]: value || "" });
  //   if (cb) cb(value);
  // };

  return {
    // handleChange,
    // resetGraphData: () => setNoGraphData(false),
    // getGraphDataFromUrl,
    noGraphData,
    imgUploadPending,
    urlGraphFetchPending,
    // handleUrlChange,
    // onUploadStateChange,
    uploadImage,
  };
};

export default useEditableLystItem;
