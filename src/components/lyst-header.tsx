import React, { FC, useState, useEffect } from "react";
import { Box, Heading, Text, TextInput, TextArea, CheckBox, ThemeContext, Button } from "grommet";
import { Edit, Bookmark } from "grommet-icons";

import SObjectFitImage from "../styled-components/object-fit-image";
import giftImg from "../icons/stock-gifts.svg";
import BorderlessButton from "./borderless-button";
import { ILyst } from "../store/types";
import Modal from "./modal";

interface WishLystUserActions {
  isSaved: boolean;
  onToggle: () => void;
}

interface IProps {
  lyst: Pick<ILyst, "thumb" | "name" | "description" | "_private" | "public">;
  editable?: boolean;
  onUpdateDetails?: (keyValuePair: Partial<ILyst>) => void;
  saveOptions?: WishLystUserActions;
}

const LystHeader: FC<IProps> = ({ lyst, editable, onUpdateDetails, saveOptions }) => {
  const [lystName, setLystName] = useState(lyst.name);
  const [lystDescription, setLystDescription] = useState(lyst.description || "");
  const [editMode, setEditMode] = useState<"name" | "description" | false>(false);
  const modalTitle = editMode === "name" ? "Change wishlyst name" : editMode === "description" ? "Update wishlyst info" : "";

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

  return (
    <>
      <Box direction="row" align="center" gap="medium">
        <Box width="300px" height="300px" border style={{ borderRadius: 12 }}>
          <SObjectFitImage src={giftImg} />
        </Box>
        <div>
          <Box direction="row" gap="small">
            <Heading margin={{ top: "none" }} level={1} children={lyst.name} />
            {editable && (
              <Heading margin={{ top: "none" }} level={1} as="span">
                <BorderlessButton
                  icon={<Edit />}
                  label="Change name"
                  textProps={{ color: "dark-3", size: "small" }}
                  onClick={() => setEditMode("name")}
                />
              </Heading>
            )}
          </Box>
          {(editable || lyst.description) && (
            <Box direction="row" gap="small" align="start">
              <Text size="large" color="dark-6" children={lyst.description || "(Add a brief introduction)"} />
              {editable && (
                <BorderlessButton
                  icon={<Edit />}
                  label="Edit"
                  textProps={{ color: "dark-3", size: "small" }}
                  onClick={() => setEditMode("description")}
                />
              )}
            </Box>
          )}
          {editable && onUpdateDetails && (
            <Box margin={{ top: "medium" }}>
              <ThemeContext.Extend value={{ checkBox: { toggle: { background: lyst.public ? "rgba(222,181,54,0.5)" : "transparent" } } }}>
                <CheckBox toggle checked={lyst.public} onChange={e => onUpdateDetails({ public: e.target.checked })} label="Sharable?" />
              </ThemeContext.Extend>
            </Box>
          )}
          {!editable && saveOptions && (
            <Button margin={{ top: "medium" }} plain={true} onClick={saveOptions.onToggle}>
              <Box direction="row">
                <Bookmark color={saveOptions.isSaved ? "brand" : undefined} />
                {saveOptions.isSaved ? <Text>Remove from saved bookmarks</Text> : <Text>Add wishlyst to saved bookmarks</Text>}
              </Box>
            </Button>
          )}
        </div>
      </Box>
      {editMode && (
        <Modal
          title={modalTitle}
          onClose={onCancel}
          primaryActions={[{ label: "Save", onClick: onSubmit }]}
          secondaryActions={[{ label: "Cancel", onClick: onCancel }]}
        >
          {editMode === "name" && <TextInput value={lystName} onChange={e => setLystName(e.target.value)} required />}
          {editMode === "description" && <TextArea value={lystDescription} onChange={e => setLystDescription(e.target.value)} required />}
        </Modal>
      )}
    </>
  );
};

export default LystHeader;
