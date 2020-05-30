import React, { FC, useState, useContext } from "react";
import Modal from "./modal";
import SObjectFitImage from "../styled-components/object-fit-image";
import FirebaseImage from "./firebase-image";
import { Box, Tabs, Tab, ResponsiveContext } from "grommet";
import ImageUpload from "./image-upload";
import ImageUploadPlaceholder from "./image-upload-placeholder";

interface Props {
  onClose: () => void;
  activeRef?: string;
  customUploadRef: string;
  onSubmit: (ref: string) => any;
}

const ChangeLystImageModal: FC<Props> = ({ onClose, activeRef, onSubmit, customUploadRef }) => {
  const [selected, setSelected] = useState("");
  const isMobile = useContext(ResponsiveContext) === "small";

  const stockImageRefs = [
    "defaults/lyst_images/stock-gifts.svg",
    "defaults/lyst_images/jfbv_qmpo_171226.jpg",
    "defaults/lyst_images/cakes.svg",
  ];

  return (
    <Modal
      title="Change lyst image"
      onClose={onClose}
      primaryActions={[
        { label: "Change", onClick: () => onSubmit(selected) },
        { label: "Cancel", onClick: onClose },
      ]}
    >
      <Tabs>
        <Tab title="Library">
          <Box gap="medium" margin={{ top: "large" }} direction="row">
            {stockImageRefs.map(imageRef => {
              const isActive = activeRef === imageRef;
              const isSelected = imageRef === selected;
              return (
                <Box
                  key={imageRef}
                  onClick={() => setSelected(imageRef)}
                  style={{ width: isMobile ? "33%" : "25%", height: isMobile ? 100 : 150, borderRadius: 12, overflow: "hidden" }}
                  border={isActive ? { size: "5px", color: "brand" } : isSelected ? { color: "brand" } : true}
                >
                  <FirebaseImage imageRef={imageRef} children={url => <SObjectFitImage src={url} />} />
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
              onUploadSuccess={uploadSnap => onSubmit(uploadSnap.ref.fullPath)}
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
