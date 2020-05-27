import React, { FC, useContext } from "react";
import { Heading, Box, Button, Text, ResponsiveContext } from "grommet";
import { firestore } from "firebase/app";

import { ILystItem } from "../../@types";
import Spinner from "../spinner";
import SObjectFitImage from "../../styled-components/object-fit-image";

interface IProps {
  imgList?: ILystItem["suggestedImages"];
  pending: boolean;
  uploadingUrlSrc?: string;
  onUpload: (src: string, isBlob: boolean) => void;
  width: string;
  height: string;
  buttonContainerHeight: number;
}

const UrlSection: FC<IProps> = ({ imgList, pending, uploadingUrlSrc, onUpload, width, height, buttonContainerHeight }) => {
  const isMobile = useContext(ResponsiveContext) === "small";

  const renderImg = (src: string | firestore.Blob) => {
    const imgSrc = typeof src === "string" ? src : `data:image/jpg;base64, ${src.toBase64()}`;
    const showSpinner = uploadingUrlSrc === imgSrc;
    const disable = !!uploadingUrlSrc;
    return (
      <div>
        <Box style={{ display: "block" }} width={width} height={height} border={{ size: "3px", color: "dark-3" }}>
          <SObjectFitImage src={imgSrc} />
        </Box>
        <Box style={{ height: buttonContainerHeight }} align="center" margin={{ top: "xxsmall" }}>
          <Button
            icon={showSpinner ? <Spinner size="small" /> : undefined}
            disabled={disable || pending}
            label={isMobile ? "Use" : "Use this image"}
            size="small"
            onClick={() => onUpload(imgSrc, typeof src !== "string")}
            focusIndicator={false}
          />
        </Box>
      </div>
    );
  };

  return (
    <div>
      <Heading level={6} size="small" responsive={false} as="header" children="From url" margin={{ bottom: "xsmall" }} />
      <Box direction="row" gap="small">
        {!imgList || !imgList.length ? (
          <div>
            <Box width={width} height={height} justify="center" pad="xsmall" border={pending ? undefined : { style: "dashed" }}>
              {pending ? (
                <Spinner color="brand" />
              ) : (
                <Text size="xsmall" textAlign="center" color="dark-6">
                  Images automatically appear here if found on the item url
                </Text>
              )}
            </Box>
            <div style={{ height: buttonContainerHeight }} />
          </div>
        ) : (
          imgList.map((src, idx) => <React.Fragment key={idx}>{renderImg(src)}</React.Fragment>)
        )}
      </Box>
    </div>
  );
};

export default UrlSection;
