import React, { FC, useState, useContext } from "react";
import Modal from "./modal";
import SObjectFitImage from "../styled-components/object-fit-image";
import { Box, Tabs, Tab, ResponsiveContext } from "grommet";
import ImageUpload from "./image-upload";
import ImageUploadPlaceholder from "./image-upload-placeholder";

type IOnSubmitProps =
  | {
      isCustomImage: false;
      downloadUrl: string;
    }
  | {
      isCustomImage: true;
      storageRef: string;
      downloadUrl: string;
    };
interface Props {
  onClose: () => void;
  activeImgUrl?: string;
  customUploadRef: string;
  onSubmit: (props: IOnSubmitProps) => any;
}

const ChangeLystImageModal: FC<Props> = ({ onClose, activeImgUrl, onSubmit, customUploadRef }) => {
  const [selected, setSelected] = useState("");
  const isMobile = useContext(ResponsiveContext) === "small";

  const stockImageUrls = [
    "https://firebasestorage.googleapis.com/v0/b/gift-wishlyst.appspot.com/o/defaults%2Flyst_images%2Fstock-gifts.svg?alt=media&token=d3b2155e-c78e-4f5d-a8ac-97c45d8b76f0",
    "https://firebasestorage.googleapis.com/v0/b/gift-wishlyst.appspot.com/o/defaults%2Flyst_images%2Fjfbv_qmpo_171226.jpg?alt=media&token=73a76851-43c5-4234-b22f-548670a54f74",
    "https://firebasestorage.googleapis.com/v0/b/gift-wishlyst.appspot.com/o/defaults%2Flyst_images%2Fcakes.svg?alt=media&token=22de6a52-9fd1-4a3d-8fd6-7076cb56f2a7",
  ];

  return (
    <Modal
      title="Change lyst image"
      onClose={onClose}
      primaryActions={[
        { label: "Change", onClick: () => onSubmit({ isCustomImage: false, downloadUrl: selected }) },
        { label: "Cancel", onClick: onClose },
      ]}
    >
      <Tabs>
        <Tab title="Library">
          <Box gap="medium" margin={{ top: "large" }} direction="row">
            {stockImageUrls.map(imageUrl => {
              const isActive = activeImgUrl === imageUrl;
              const isSelected = imageUrl === selected;
              return (
                <Box
                  key={imageUrl}
                  onClick={() => setSelected(imageUrl)}
                  style={{ width: isMobile ? "33%" : "25%", height: isMobile ? 100 : 150, borderRadius: 12, overflow: "hidden" }}
                  border={isActive ? { size: "5px", color: "brand" } : isSelected ? { color: "brand" } : true}
                >
                  <SObjectFitImage src={imageUrl} />
                </Box>
              );
            })}
          </Box>
        </Tab>
        <Tab title="Upload your own">
          <Box margin={{ top: "large" }} height="300px">
            <ImageUpload
              name="lyst-header"
              uploadRefPath={customUploadRef}
              onUploadSuccess={async uploadSnap => {
                const downloadUrl = await uploadSnap.ref.getDownloadURL();
                onSubmit({ isCustomImage: true, storageRef: uploadSnap.ref.fullPath, downloadUrl });
              }}
            >
              {({ name, onUpload }) => <ImageUploadPlaceholder onInputFileChange={onUpload} name={name} />}
            </ImageUpload>
          </Box>
        </Tab>
      </Tabs>
    </Modal>
  );
};

export default ChangeLystImageModal;
