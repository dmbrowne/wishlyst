import React, { useState, useContext, FC } from "react";
import { Heading, Text, Box, Button, ResponsiveContext } from "grommet";
import BlobRenderer from "../blob-renderer";
import SObjectFitImage from "../../styled-components/object-fit-image";
import CircleButton from "../circle-button";
import { SOverlayActions } from "../../styled-components/overlay-actions";
import { Refresh, Clipboard } from "grommet-icons";
import Spinner from "../spinner";

interface IProps {
  disabled?: boolean;
  showSpinner?: boolean;
  onUse: (src: string) => void;
  width: string;
  height: string;
  buttonContainerHeight: number;
}

const ClipboardSection: FC<IProps> = ({ disabled, onUse, showSpinner, width, height, buttonContainerHeight }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const [clipboardBlob, setClipboardBlob] = useState<Blob>();
  const [clipboardError, setClipboardError] = useState("");

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

  const OverlayUploadButton = () => {
    const label = `Take a screenshot of the item, then ${isMobile ? "press" : "click"} here`;
    return isMobile ? (
      <Box pad="xsmall" children={<Text size="xsmall" textAlign="center" color="dark-6" children={label} />} />
    ) : (
      <CircleButton
        icon={clipboardBlob ? <Refresh /> : <Clipboard />}
        backgroundColorType={clipboardBlob ? "white" : "brand"}
        onClick={getDataFromClipboard}
        label={label}
      />
    );
  };

  const OverlayError = () => (
    <div>
      <Text color="white" size="small" children="An error occured, please try again." />
      <CircleButton icon={<Clipboard />} backgroundColorType="white" onClick={getDataFromClipboard} />
    </div>
  );

  return (
    <div style={{ width }}>
      <Heading level={6} size="small" responsive={false} as="header" children="From clipboard" margin={{ bottom: "xsmall" }} />
      <BlobRenderer blob={clipboardBlob}>
        {src => (
          <>
            <Box width={width} height={height} border={{ style: "dashed" }} style={{ position: "relative", overflow: "hidden" }}>
              {!!src && <SObjectFitImage src={src} />}
              <SOverlayActions background={clipboardError ? "red" : undefined} autoHide={clipboardError ? false : !!clipboardBlob}>
                {clipboardError ? <OverlayError /> : <OverlayUploadButton />}
              </SOverlayActions>
            </Box>
            <div style={{ height: buttonContainerHeight }}>
              {src && (
                <Box direction="row" justify="between">
                  <Button
                    disabled={disabled}
                    label="Refresh"
                    icon={!isMobile ? <Refresh size="small" /> : undefined}
                    size="small"
                    alignSelf="start"
                    onClick={getDataFromClipboard}
                    focusIndicator={false}
                  />
                  <Button
                    icon={showSpinner ? <Spinner size="small" /> : undefined}
                    disabled={disabled}
                    label={isMobile ? "Use" : "Use this"}
                    size="small"
                    alignSelf="end"
                    onClick={() => onUse(src)}
                    focusIndicator={false}
                  />
                </Box>
              )}
            </div>
          </>
        )}
      </BlobRenderer>
    </div>
  );
};

export default ClipboardSection;
