import React, { FC, useState, ChangeEvent, useContext } from "react";
import Modal, { IProps as ModalProps } from "./modal";
import { Text, Box, Heading, RadioButton, TextInputProps, Button, ThemeContext, ResponsiveContext } from "grommet";
import { useFormik } from "formik";
import * as Yup from "yup";

import ClaimInfoList from "./claim-info-list";
import { useStateSelector, getAmountClaimed } from "../store";
import { useTheme } from "styled-components";
import { slugify } from "../utils/slugify";
import FieldInput from "./field-input";
import useLystItemActions from "../hooks/use-lyst-item-actions";

interface IProps extends Omit<ModalProps, "title"> {
  lystItemId: string;
}

type MeOptionType = { isSelected: boolean; onSelect: () => any };
const MeOption: FC<MeOptionType> = ({ isSelected, onSelect }) => (
  <Box direction="row" gap="medium" align="start">
    <RadioButton name="user-search" checked={isSelected} onChange={onSelect} />
    <Text style={{ opacity: isSelected ? 1 : 0.7 }}>Myself</Text>
  </Box>
);

type UserSearchType = { isSelected: boolean; onSelect: () => any };
const UserSearch: FC<UserSearchType> = ({ isSelected, onSelect }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  return (
    <Box direction="row" gap="medium" align="start">
      <RadioButton name="user-search" checked={isSelected} onChange={onSelect} />
      <Box {...(!isMobile ? { flex: "grow" } : {})} style={{ opacity: isSelected ? 1 : 0.7 }}>
        <FieldInput label="Search for thier name if they're on Wishlyst" disabled={!isSelected} />
      </Box>
    </Box>
  );
};

interface IAnonymousForm extends Omit<TextInputProps, "value"> {
  value: string;
  isSelected: boolean;
  onSelect: () => any;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
const AnonymousForm: FC<IAnonymousForm> = ({ isSelected, onSelect, error, ...props }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  return (
    <Box direction="row" gap="medium" align="start">
      <RadioButton name="user-search" value="anonymous" checked={isSelected} onChange={onSelect} />
      <Box {...(!isMobile ? { flex: "grow" } : {})} style={{ opacity: isSelected ? 1 : 0.7 }}>
        <FieldInput {...props} label={"Manually enter thier name if they're not"} error={error} disabled={!isSelected} />
      </Box>
    </Box>
  );
};

const EditableClaimItemModal: FC<IProps> = ({ onClose, lystItemId }) => {
  const { dark } = useTheme();
  const account = useStateSelector(({ auth }) => auth.account);
  const lystItem = useStateSelector(state => state.lystItems.allItems[lystItemId]);
  const { anonymousClaim, claimForRegisteredUser, removeClaim } = useLystItemActions(lystItem.lystId, lystItem.id);
  const amountClaimed = getAmountClaimed(lystItem.buyers);
  const hasBuyers = amountClaimed > 0;
  const completelyClaimed = amountClaimed >= lystItem.quantity;

  const [selectedBuyerOption, setSelectedBuyerOption] = useState<"me" | "user" | "anonymous">("me");
  const [selectedUserId] = useState("");

  const validationSchema = Yup.object().shape({ displayName: Yup.string().required() });
  const anonymousForm = useFormik({ validateOnMount: true, initialValues: { displayName: "" }, validationSchema, onSubmit: () => {} });

  const onBtnIncrement = (isAnon: boolean, userId: string, increment: "asc" | "desc") => {
    const incrementValue = increment === "asc" ? 1 : -1;
    if (isAnon) anonymousClaim(incrementValue, userId);
    else claimForRegisteredUser(incrementValue, userId);
  };

  const addFormIsValid = () => {
    if (selectedBuyerOption === "me") return true;
    if (selectedBuyerOption === "user") return !!selectedUserId;
    if (selectedBuyerOption === "anonymous") return anonymousForm.isValid;
    else return false;
  };

  const onAddSubmit = () => {
    if (!account) return;
    if (selectedBuyerOption === "me") return claimForRegisteredUser(1, account.uid);
    if (selectedBuyerOption === "user") return claimForRegisteredUser(1, selectedUserId);
    if (selectedBuyerOption === "anonymous") {
      const displayName = anonymousForm.values.displayName;
      const userId = slugify(displayName);
      anonymousClaim(1, userId, displayName);
      return anonymousForm.resetForm();
    } else {
      return false;
    }
  };

  return (
    <Modal title="Claim item" onClose={onClose}>
      <Heading level={5} children="Who's buying it?" />
      <ClaimInfoList
        lystItem={lystItem}
        showCount={lystItem.quantity > 1}
        onIncrement={(anon, id) => onBtnIncrement(anon, id, "asc")}
        onDecrement={(anon, id) => onBtnIncrement(anon, id, "desc")}
        onDelete={(anon, id) => removeClaim(id, anon)}
      />

      {hasBuyers && !completelyClaimed && <Heading level={5}>Add more buyers:</Heading>}
      {!completelyClaimed && (
        <ThemeContext.Extend value={{ formField: { label: { margin: { top: "0", left: "0" } } } }}>
          <Box pad="medium" background={dark ? "dark-1" : "light-1"} style={{ borderRadius: 12 }}>
            <Box pad={{ right: "large" }}>
              <Box margin={{ bottom: "large" }}>
                <MeOption isSelected={selectedBuyerOption === "me"} onSelect={() => setSelectedBuyerOption("me")} />
              </Box>
              <Box margin={{ bottom: "large" }}>
                <UserSearch isSelected={selectedBuyerOption === "user"} onSelect={() => setSelectedBuyerOption("user")} />
              </Box>
              <Box margin={{ bottom: "medium" }}>
                <AnonymousForm
                  name="displayName"
                  value={anonymousForm.values.displayName}
                  error={anonymousForm.errors.displayName}
                  isSelected={selectedBuyerOption === "anonymous"}
                  onSelect={() => setSelectedBuyerOption("anonymous")}
                  onChange={anonymousForm.handleChange}
                />
              </Box>
            </Box>
            <Button primary label="Add buyer" alignSelf="end" disabled={!addFormIsValid()} onClick={onAddSubmit} />
          </Box>
        </ThemeContext.Extend>
      )}
    </Modal>
  );
};

export default EditableClaimItemModal;
