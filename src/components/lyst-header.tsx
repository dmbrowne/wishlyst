import React, { FC, useState, useEffect, useContext } from "react";
import { Box, Heading, Text, TextInput, TextArea, CheckBox, ThemeContext, Button, ResponsiveContext } from "grommet";
import { Edit, Bookmark, Copy, Favorite, More, SettingsOption, Configure } from "grommet-icons";

import SObjectFitImage from "../styled-components/object-fit-image";
import BorderlessButton from "./borderless-button";
import { ILyst } from "../store/types";
import Modal from "./modal";
import { SOverlayActions } from "./image-upload-component.styles";
import ChangeLystImageModal from "./change-lyst-image-modal";
import FirebaseImage from "./firebase-image";
import shortenUrl from "../utils/url-shorten";
import { useTheme } from "styled-components";

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
  const { dark } = useTheme();
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
  }, [lyst]);

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

  const onChangeImage = (imgRef: string) => {
    if (onUpdateDetails) onUpdateDetails({ thumb: imgRef });
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

  const onCopyShortUrl = () => {
    navigator.permissions.query({ name: "clipboard-write" as "clipboard" }).then(result => {
      if (result.state === "granted" || result.state === "prompt") {
        if (lyst.shortUrl) {
          navigator.clipboard.writeText(lyst.shortUrl).then(() => alert("Copied!"));
        }
      }
    });
  };

  return (
    <>
      <Box direction={isMobile ? "column" : "row"} width={isMobile ? "100%" : "auto"} align="center" gap="medium">
        <Box
          alignSelf={isMobile ? "start" : undefined}
          width="300px"
          height={isMobile ? "150px" : "350px"}
          border
          style={{ borderRadius: 12, position: "relative", overflow: "hidden" }}
        >
          {lyst.thumb && <FirebaseImage imageRef={lyst.thumb}>{url => <SObjectFitImage src={url} />}</FirebaseImage>}
          {editable && (
            <SOverlayActions autoHide justify="center">
              <Button alignSelf="center" onClick={() => setChangeImageModalVisible(true)}>
                <Box background="brand" elevation="large" border={{ color: "white" }} pad="medium" style={{ borderRadius: "50%" }}>
                  <Edit color="white" />
                </Box>
              </Button>
            </SOverlayActions>
          )}
        </Box>
        <div {...(isMobile ? { style: { width: "100%" } } : {})}>
          <Box margin={{ bottom: isMobile ? "large" : "medium" }}>
            <Box direction={isMobile ? "column" : "row"} gap={!isMobile ? "small" : "none"} margin={{ bottom: "medium" }}>
              <Heading margin="none" level={isMobile ? 2 : 1} as="h1" children={lyst.name} />
              {editable && (
                <Heading margin="none" level={isMobile ? 4 : 1} as="span">
                  <BorderlessButton
                    icon={<Edit size={isMobile ? "small" : "medium"} />}
                    label="Change name"
                    textProps={{ color: "dark-3", size: "small" }}
                    onClick={() => setEditMode("name")}
                  />
                </Heading>
              )}
            </Box>
            {(editable || lyst.description) && (
              <Box direction={isMobile ? "column" : "row"} gap={!isMobile ? "small" : "none"} align="start" margin={{ bottom: "medium" }}>
                <Text size={isMobile ? "medium" : "large"} color="dark-6" children={lyst.description || "(Add a brief introduction)"} />
                {editable && (
                  <BorderlessButton
                    icon={<Edit size={isMobile ? "small" : "medium"} />}
                    label="Edit"
                    textProps={{ color: "dark-3", size: "small" }}
                    onClick={() => setEditMode("description")}
                  />
                )}
              </Box>
            )}
          </Box>
          {editable && onUpdateDetails && (
            <Box margin={{ bottom: "small" }}>
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
              {lyst.public && (
                <Box direction="row" margin={{ top: "medium" }} align="center" gap="small">
                  <Box width="250px">
                    <TextInput size="small" value={lyst.shortUrl} />
                  </Box>
                  <Button plain icon={<Copy />} onClick={onCopyShortUrl} />
                </Box>
              )}
            </Box>
          )}
          {editable && onMore && (
            <Button primary size="small" margin={{ top: "small" }} icon={<Configure size="20px" />} label="More options" onClick={onMore} />
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
          onSubmit={onChangeImage}
        />
      )}
    </>
  );
};

export default LystHeader;
