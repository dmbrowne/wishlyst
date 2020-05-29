import React, { FC, useState, useContext } from "react";
import { Box, BoxTypes, ResponsiveContext } from "grommet";
import { ILystItem } from "../../@types";
import getBase64FromUrl from "../../utils/get-image-from-url";
import MainImage from "./main-image";
import ClipboardSection from "./clipboard-section";
import UrlSection from "./url-section";
import { storage } from "firebase";

export interface IImageSelectionList {
  name: string;
  uploadRefPath: string;
  previewImageRef?: string;
  fetchingUrlImage?: boolean;
  uploadPending?: boolean;
  hideClipboard?: boolean;
  imgList?: ILystItem["suggestedImages"];
  containerProps?: BoxTypes;
  onSelectImage?: (dataUrl: string) => Promise<any>;
  onDeleteImageSuccess: () => any;
  onUploadImageSuccess: (task: storage.UploadTaskSnapshot) => any;
}

const ImageSelectionList: FC<IImageSelectionList> = ({
  uploadPending,
  fetchingUrlImage,
  hideClipboard,
  imgList = [],
  containerProps,
  onSelectImage,
  onUploadImageSuccess,
  onDeleteImageSuccess,
  ...props
}) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const mainImageWidth = isMobile ? "50vw" : "300px";
  const mainImageHeight = isMobile ? "130px" : "210px";
  const sectionWidth = isMobile ? "40vw" : "250px";
  const sectionHeight = isMobile ? "100px" : "170px";
  const buttonContainerHeight = 40;
  const [hasClipboardPermission] = useState("clipboard" in navigator);
  const [uploadingClipboard, setUploadingClipboard] = useState(false);
  const [uploadingUrlSrc, setUploadingUrlSrc] = useState<string | null>(null);

  const onUploadFromClipboard = (src: string) => {
    setUploadingClipboard(true);
    onUploadImage(src).then(() => setUploadingClipboard(false));
  };

  const onUploadFromUrl = (src: string, isBlob: boolean) => {
    setUploadingUrlSrc(src);
    const promise = !isBlob ? onSelectUrl(src) : onUploadImage(src);
    promise.then(() => setUploadingUrlSrc(null));
  };

  const onSelectUrl = async (url: string) => {
    if (onSelectImage) {
      const dataUrl = await new Promise<string>(resolve => getBase64FromUrl(url, resolve));
      return onSelectImage(dataUrl);
    } else {
      return Promise.reject();
    }
  };

  const onUploadImage = (dataUrl: string) => {
    if (onSelectImage) {
      return onSelectImage(dataUrl);
    } else {
      return Promise.reject();
    }
  };

  return (
    <Box gap="medium" align="end" {...containerProps} direction="row" wrap={false} overflow={{ horizontal: "auto" }}>
      <MainImage
        width={mainImageWidth}
        height={mainImageHeight}
        uploadRef={props.uploadRefPath}
        thumbRef={props.previewImageRef}
        onDeleteSuccess={onDeleteImageSuccess}
        onUploadSuccess={onUploadImageSuccess}
        buttonContainerHeight={buttonContainerHeight}
        showUploadSpinner={!!uploadingUrlSrc}
      />
      {!hideClipboard && hasClipboardPermission && (
        <ClipboardSection
          buttonContainerHeight={buttonContainerHeight}
          width={sectionWidth}
          height={sectionHeight}
          disabled={!!uploadingUrlSrc || uploadingClipboard}
          showSpinner={uploadingClipboard}
          onUse={onUploadFromClipboard}
        />
      )}
      <UrlSection
        buttonContainerHeight={buttonContainerHeight}
        width={sectionWidth}
        height={sectionHeight}
        imgList={imgList}
        pending={fetchingUrlImage || false}
        uploadingUrlSrc={uploadingUrlSrc || undefined}
        onUpload={onUploadFromUrl}
      />
    </Box>
  );
};

export default ImageSelectionList;
