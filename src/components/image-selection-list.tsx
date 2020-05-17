import React, { FC, useState } from "react";
import { Box, Heading, Text, BoxTypes, Button } from "grommet";
import ImageUpload, { IProps as ImageUploadProps } from "./image-upload-container";
import Spinner from "./spinner";
import SObjectFitImage from "../styled-components/object-fit-image";
import { ILystItem } from "../store/types";
import BlobRenderer from "./blob-renderer";
import { SOverlayActions } from "./image-upload-component.styles";
import CircleButton from "./circle-button";
import { Refresh, Clipboard } from "grommet-icons";
import getBase64FromUrl from "../utils/get-image-from-url";

export interface IImageSelectionList extends ImageUploadProps {
  fetchingUrlImage?: boolean;
  uploadPending?: boolean;
  hideClipboard?: boolean;
  imgList?: ILystItem["suggestedImages"];
  containerProps?: BoxTypes;
  onSelectImage?: (dataUrl: string) => Promise<any>;
}

const ButtonContainer: FC<BoxTypes> = props => <Box margin={{ top: "xsmall" }} height="35px" {...props} />;

const ImageSelectionList: FC<IImageSelectionList> = ({
  uploadPending,
  fetchingUrlImage,
  hideClipboard,
  imgList,
  containerProps,
  onSelectImage,
  ...props
}) => {
  const [hasClipboardPermission] = useState("clipboard" in navigator);
  const [clipboardBlob, setClipboardBlob] = useState<Blob>();
  const [clipboardError, setClipboardError] = useState("");
  const [uploadingSrc, setUploadSrc] = useState("");

  const getDataFromClipboard = async () => {
    setClipboardError("");
    const [clipboardItem] = await ((navigator.clipboard as any).read() as Promise<DataTransfer[]>);
    const [type] = clipboardItem.types;
    if (type === "image/png" || type === "image/jpeg") {
      const blob = await ((clipboardItem as any).getType(type) as Promise<Blob>);
      setClipboardBlob(blob);
    } else {
      setClipboardError("No images found on the clipboard, try copying the image again, then press the paste button");
    }
  };

  const clipboardButtonLabel = clipboardError ? (
    <Text color="status-error" textAlign="center" size="small" children={clipboardError} />
  ) : (
    "Add an image to your clipboard by taking a screenshot, then press the paste button above"
  );

  const onSelectUrl = async (url: string) => {
    if (onSelectImage) {
      setUploadSrc(url);
      const dataUrl = await new Promise<string>(resolve => getBase64FromUrl(url, resolve));
      onSelectImage(dataUrl).then(() => setUploadSrc(""));
    }
  };

  const onUploadImage = (dataUrl: string) => {
    if (onSelectImage) {
      setUploadSrc(dataUrl);
      onSelectImage(dataUrl).then(() => setUploadSrc(""));
    }
  };

  return (
    <Box gap="medium" align="end" {...containerProps} direction="row" wrap={false} overflow={{ horizontal: "auto" }}>
      <div style={{ width: 300 }}>
        <Box width="300px" height="195px" justify="center">
          {uploadPending ? <Spinner color="brand" /> : <ImageUpload label={props.previewImageRef ? "" : "Upload an image"} {...props} />}
        </Box>
        {onSelectImage && (
          <ButtonContainer direction="row" justify="between">
            <Button primary color="light-1" size="small" label="Upload" />
            <Button size="small" color="status-critical" label="Remove" />
          </ButtonContainer>
        )}
      </div>
      {!hideClipboard && hasClipboardPermission && (
        <div style={{ width: 250 }}>
          <Heading level={6} size="small" as="div" children="From clipboard" margin={{ bottom: "xsmall" }} />
          <BlobRenderer blob={clipboardBlob}>
            {src => (
              <>
                <Box width="250px" height="170px" border={{ style: "dashed" }} style={{ position: "relative", overflow: "hidden" }}>
                  {!!src && <SObjectFitImage src={src} />}
                  <SOverlayActions autoHide={!!clipboardBlob}>
                    {!clipboardBlob ? (
                      <CircleButton
                        icon={<Clipboard />}
                        backgroundColorType="brand"
                        onClick={getDataFromClipboard}
                        label={clipboardButtonLabel}
                      />
                    ) : (
                      <CircleButton icon={<Refresh />} backgroundColorType="white" label="Refresh clipboard image" />
                    )}
                  </SOverlayActions>
                </Box>
                {onSelectImage && (
                  <ButtonContainer>
                    {src && (
                      <Button
                        icon={uploadingSrc === src ? <Spinner size="small" /> : undefined}
                        disabled={uploadPending}
                        label="Use this image"
                        size="small"
                        alignSelf="start"
                        onClick={() => onUploadImage(src)}
                        focusIndicator={false}
                      />
                    )}
                  </ButtonContainer>
                )}
              </>
            )}
          </BlobRenderer>
        </div>
      )}
      <div>
        <Heading level={6} size="small" as="div" children="From url" margin={{ bottom: "xsmall" }} />
        <Box direction="row" gap="small">
          {fetchingUrlImage && (
            <div>
              <Box width="100px" height="170px" align="center" justify="center" children={<Spinner color="brand" />} />
              <ButtonContainer />
            </div>
          )}
          {!fetchingUrlImage && !imgList && (
            <div>
              <Box width="200px" height="170px" border={{ style: "dashed" }} />
              <ButtonContainer />
            </div>
          )}
          {imgList &&
            imgList.map(src => {
              const imgSrc = typeof src === "string" ? src : `data:image/jpg;base64, ${src.toBase64()}`;
              const onClick = onSelectImage
                ? typeof src === "string"
                  ? () => onSelectUrl(imgSrc)
                  : () => onUploadImage(imgSrc)
                : undefined;
              return (
                <div key={imgSrc}>
                  <Box width="232px" height="170px" children={<SObjectFitImage src={imgSrc} />} border={{ size: "3px", color: "dark-3" }} />
                  {onSelectImage && (
                    <ButtonContainer>
                      <Button
                        icon={uploadingSrc === imgSrc ? <Spinner size="small" /> : undefined}
                        disabled={uploadPending}
                        label="Use this image"
                        size="small"
                        alignSelf="start"
                        onClick={onClick}
                        focusIndicator={false}
                      />
                    </ButtonContainer>
                  )}
                </div>
              );
            })}
        </Box>
      </div>
    </Box>
  );
};

export default ImageSelectionList;
