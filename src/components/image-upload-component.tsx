import React, { InputHTMLAttributes, FC } from "react";
import { Box, Button } from "grommet";
import { Trash } from "grommet-icons";
import FirebaseImage from "./firebase-image";
import FileInput from "./file-input";
import { SOverlayActions } from "./image-upload-component.styles";
import SObjectFitImage from "../styled-components/object-fit-image";
import UploadButton from "./upload-button";

export interface IComponentProps extends InputHTMLAttributes<HTMLInputElement> {
  onInputFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => any;
  label?: string;
  imageRef?: string;
  name: string;
}

export const ImageUploadComponent: FC<IComponentProps> = ({ onInputFileChange, onDelete, label, imageRef, children, name, ...props }) => {
  const deleteButton = (
    <Button disabled={props.disabled} onClick={onDelete}>
      <Box align="center">
        <Box background="status-critical" pad="medium" style={{ borderRadius: "50%" }} children={<Trash />} />
      </Box>
    </Button>
  );

  const uploadBtn = <UploadButton backgroundColorType={imageRef ? "white" : "brand"} label={label} disabled={props.disabled} />;

  return (
    <Box style={{ position: "relative" }} border={{ style: "dashed" }} overflow="hidden" fill>
      {imageRef ? <FirebaseImage imageRef={imageRef} children={url => <SObjectFitImage alt="cover" src={url} />} /> : null}
      <SOverlayActions autoHide={!!imageRef}>
        <Box direction="row" align="center" justify="center" gap="small">
          <Box style={{ flex: 1 }}>
            <FileInput name={name} onChange={onInputFileChange} {...props}>
              {children ? children : uploadBtn}
            </FileInput>
          </Box>
          {!!imageRef && onDelete && <Box style={{ flex: 1 }}>{deleteButton}</Box>}
        </Box>
      </SOverlayActions>
    </Box>
  );
};

export default ImageUploadComponent;
