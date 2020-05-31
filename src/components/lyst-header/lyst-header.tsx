import React, { FC, useState, useEffect, useContext } from "react";
import { Box, Heading, Text, TextInput, TextArea, CheckBox, ThemeContext, Button, ResponsiveContext } from "grommet";
import { Edit, Favorite, More } from "grommet-icons";

import SObjectFitImage from "../../styled-components/object-fit-image";
import BorderlessButton from "../borderless-button";
import { ILyst } from "../../@types";
import Modal from "../modal";
import { SOverlayActions } from "../../styled-components/overlay-actions";
import ChangeLystImageModal from "../change-lyst-image-modal";
import shortenUrl from "../../utils/url-shorten";
import { SImageContainer, SShareContainer } from "./lyst-header.styles";
import ShortUrlDisplay from "../short-url-display";

interface IProps {
  lyst: ILyst;
  editable?: boolean;
  onUpdateDetails?: (keyValuePair: Partial<ILyst>) => void;
  saveOptions?: WishLystUserActions;
  onMore?: () => void;
}

interface WishLystUserActions {
  isSaved: boolean;
  onToggle: () => void;
}

const LystHeader: FC<IProps> = ({ lyst, editable, onUpdateDetails, saveOptions, onMore }) => {
  const [lystName, setLystName] = useState(lyst.name);
  const [lystDescription, setLystDescription] = useState(lyst.description || "");
  const [editMode, setEditMode] = useState<"name" | "description" | false>(false);
  const [changeImageModalVisible, setChangeImageModalVisible] = useState(false);
  const modalTitle = editMode === "name" ? "Change wishlyst name" : editMode === "description" ? "Update wishlyst info" : "";
  const isMobile = useContext(ResponsiveContext) === "small";
  const [isSwitchingShare, setSwitchingShare] = useState(false);

  useEffect(() => {
    if (!editMode) {
      setLystName(lyst.name);
      setLystDescription(lyst.description || "");
    }
  }, [editMode, lyst]);

  const onCancel = () => {
    setLystName(lyst.name);
    setLystDescription(lyst.description || "");
    setEditMode(false);
  };

  const onSubmit = () => {
    if (editMode === "name" && lystName) {
      if (onUpdateDetails) onUpdateDetails({ name: lystName });
    }
    if (editMode === "description") {
      if (onUpdateDetails) onUpdateDetails({ description: lystDescription });
    }
    setEditMode(false);
  };

  const onChangeImage = (downloadUrl: string, isCustomImage: boolean, storageRef?: string) => {
    if (onUpdateDetails) onUpdateDetails({ image: { ...(isCustomImage ? { storageRef } : {}), downloadUrl, isCustomImage } });
    setChangeImageModalVisible(false);
  };

  const onTogglePublicVisibility = async (visible: boolean) => {
    if (!onUpdateDetails) return;

    setSwitchingShare(true);
    if (visible) {
      const { shortLink } = await shortenUrl(window.location.href);
      onUpdateDetails({ shortUrl: shortLink, public: visible });
    } else {
      onUpdateDetails({ public: visible });
    }
    setSwitchingShare(false);
  };

  const imageActionButton = (
    <Button alignSelf="center" onClick={() => setChangeImageModalVisible(true)}>
      <Box background="brand" elevation="large" border={{ color: "white" }} pad="medium" style={{ borderRadius: "50%" }}>
        <Edit color="white" />
      </Box>
    </Button>
  );

  const editButton = (label: string, onClick: () => void) => (
    <BorderlessButton
      icon={<Edit size={isMobile ? "small" : "medium"} />}
      label={label}
      textProps={{ color: "dark-3", size: "small" }}
      onClick={onClick}
    />
  );

  const checkBox = (
    <ThemeContext.Extend value={{ checkBox: { toggle: { background: lyst.public ? "rgba(222,181,54,0.5)" : "transparent" } } }}>
      <CheckBox
        disabled={isSwitchingShare}
        reverse={isMobile}
        toggle
        checked={lyst.public}
        onChange={e => onTogglePublicVisibility(e.target.checked)}
        label="Sharable?"
      />
    </ThemeContext.Extend>
  );

  return (
    <>
      <Box direction={isMobile ? "column" : "row"} width={isMobile ? "100%" : "auto"} align="center" gap="medium">
        <Box>
          <SImageContainer isMobile={isMobile}>
            {lyst.image?.downloadUrl && <SObjectFitImage src={lyst.image.downloadUrl} />}
            {editable && <SOverlayActions autoHide justify="center" children={imageActionButton} />}
          </SImageContainer>
          {editable && (
            <Box margin={{ top: "small" }} align="center">
              <Button
                hoverIndicator="brandDark"
                label={<Text color="white">{`${lyst.image ? "Change" : "Set"} cover`}</Text>}
                onClick={() => setChangeImageModalVisible(true)}
                color="brand"
                primary
              />
            </Box>
          )}
        </Box>

        <div {...(isMobile ? { style: { width: "100%" } } : {})}>
          {onMore && (
            <Box align={isMobile ? "center" : "start"} margin={{ bottom: isMobile ? "medium" : "small" }}>
              <Box round="full" overflow="hidden" border>
                <Button icon={<More />} hoverIndicator onClick={onMore} />
              </Box>
            </Box>
          )}

          <Box margin={{ bottom: isMobile ? "large" : "medium" }} align={isMobile ? "center" : "start"}>
            <Box direction="row" gap="small" margin={{ bottom: "medium" }}>
              <Heading margin="none" level={isMobile ? 2 : 1} as="h1">
                {lyst.name}
                {editable && (
                  <Heading margin={{ left: "small" }} level={isMobile ? 4 : 1} as="span">
                    {editButton("Change name", () => setEditMode("name"))}
                  </Heading>
                )}
              </Heading>
            </Box>
            {(editable || lyst.description) && (
              <Box direction="row" gap="small" align="start">
                <Text size={isMobile ? "medium" : "large"} color="dark-6" children={lyst.description || "(Add a brief introduction)"} />
                {editable && editButton("Edit", () => setEditMode("description"))}
              </Box>
            )}
          </Box>
          {editable && onUpdateDetails && (
            <SShareContainer isMobile={isMobile}>
              {checkBox}
              {lyst.public && <ShortUrlDisplay url={lyst.shortUrl || ""} />}
            </SShareContainer>
          )}
          {!editable && saveOptions && (
            <Button plain={true} onClick={saveOptions.onToggle}>
              <Box direction="row" gap="small">
                <Favorite color={saveOptions.isSaved ? "brand" : undefined} />
                {saveOptions.isSaved ? <Text>Remove from favourites</Text> : <Text>Save wishlyst to favourites</Text>}
              </Box>
            </Button>
          )}
        </div>
      </Box>
      {editMode && (
        <Modal
          title={modalTitle}
          onClose={onCancel}
          primaryActions={[
            { label: "Save", onClick: onSubmit },
            { label: "Cancel", onClick: onCancel },
          ]}
        >
          {editMode === "name" && <TextInput value={lystName} onChange={e => setLystName(e.target.value)} required />}
          {editMode === "description" && <TextArea value={lystDescription} onChange={e => setLystDescription(e.target.value)} required />}
        </Modal>
      )}
      {changeImageModalVisible && (
        <ChangeLystImageModal
          customUploadRef={`lysts/${lyst.id}/header-thumb`}
          onClose={() => setChangeImageModalVisible(false)}
          onSubmit={props => {
            if (props.isCustomImage) onChangeImage(props.downloadUrl, true, props.storageRef);
            else onChangeImage(props.downloadUrl, false);
          }}
        />
      )}
    </>
  );
};

export default LystHeader;
