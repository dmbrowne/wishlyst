import React, { useContext, FC } from "react";
import { Box, ResponsiveContext, Button, Text } from "grommet";
import { storage } from "firebase/app";
import ImageUpload from "../image-upload";
import ImageUploadPlaceholder from "../image-upload-placeholder";
import Spinner from "../spinner";
import FileInput from "../file-input";

interface IProps {
  uploadRef: string;
  thumbRef?: string;
  width: string;
  height: string;
  onDeleteSuccess: () => any;
  onUploadSuccess: (taskSnap: storage.UploadTaskSnapshot) => any;
  buttonContainerHeight: number;
  showUploadSpinner: boolean;
}

const MainImage: FC<IProps> = ({
  uploadRef,
  thumbRef,
  showUploadSpinner,
  onDeleteSuccess,
  width,
  height,
  onUploadSuccess,
  buttonContainerHeight,
}) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  return (
    <div style={{ width }}>
      <ImageUpload uploadRefPath={uploadRef} onUploadSuccess={onUploadSuccess} name={`image-upload-id-${uploadRef}`}>
        {({ name, uploadPending, onUpload, onDelete }) => {
          const isUploading = showUploadSpinner || uploadPending;
          const deleteImage = () => [onDelete, onDeleteSuccess].forEach(fn => fn());
          return (
            <>
              <Box width={width} height={height} justify="center">
                {isUploading ? (
                  <Spinner color="brand" />
                ) : (
                  <ImageUploadPlaceholder
                    name={name}
                    imageRef={thumbRef}
                    onInputFileChange={onUpload}
                    label="Upload an image"
                    onDelete={deleteImage}
                  />
                )}
              </Box>
              <div style={{ height: buttonContainerHeight, marginTop: 4 }}>
                {!isUploading && thumbRef && isMobile && (
                  <Box direction="row" justify="between">
                    <FileInput name={name}>
                      <Button primary color="light-1" size="small" label="Upload" />
                    </FileInput>

                    <Button size="small" onClick={deleteImage}>
                      <Box background="status-critical-bg" pad={{ vertical: "small", horizontal: "medium" }}>
                        <Text size="small" color="status-critical" children="Remove" />
                      </Box>
                    </Button>
                  </Box>
                )}
              </div>
            </>
          );
        }}
      </ImageUpload>
    </div>
  );
};

export default MainImage;
