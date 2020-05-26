import React, { InputHTMLAttributes, FC } from "react";
import { Box } from "grommet";
import { Trash } from "grommet-icons";
import FirebaseImage from "./firebase-image";
import FileInput, { IProps as IFileInputProps } from "./file-input";
import { SOverlayActions } from "../styled-components/overlay-actions";
import SObjectFitImage from "../styled-components/object-fit-image";
import UploadButton from "./upload-button";
import CircleButton from "./circle-button";

export interface IComponentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name">, IFileInputProps {
  onInputFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => any;
  imageRef?: string;
}

export const ImageUploadPlaceholder: FC<IComponentProps> = ({ onInputFileChange, onDelete, label, imageRef, name, ...props }) => {
  const deleteButton = <CircleButton backgroundColorType="status-critical" icon={<Trash />} disabled={props.disabled} onClick={onDelete} />;

  const uploadBtn = <UploadButton backgroundColorType={imageRef ? "white" : "brand"} label={label} disabled={props.disabled} />;

  return (
    <Box style={{ position: "relative" }} border={{ style: "dashed" }} overflow="hidden" fill>
      {imageRef ? <FirebaseImage imageRef={imageRef} children={url => <SObjectFitImage alt="cover" src={url} />} /> : null}
      <SOverlayActions autoHide={!!imageRef}>
        <Box direction="row" align="start" justify="center" gap="small">
          <Box style={{ flex: 1 }}>
            <FileInput name={name} onChange={onInputFileChange} {...props}>
              {uploadBtn}
            </FileInput>
          </Box>
          {!!imageRef && onDelete && <Box style={{ flex: 1 }}>{deleteButton}</Box>}
        </Box>
      </SOverlayActions>
    </Box>
  );
};

export default ImageUploadPlaceholder;
