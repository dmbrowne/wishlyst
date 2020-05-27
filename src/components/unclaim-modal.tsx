import React, { FC } from "react";
import { ILystItem } from "../store/types";
import useLystItemActions from "../hooks/use-lyst-item-actions";
import Modal from "./modal";
import { Heading, Button } from "grommet";
import { useStateSelector } from "../store";

interface IProps {
  lystItem: ILystItem;
  onClose: () => void;
}

const UnclaimModal: FC<IProps> = ({ lystItem, onClose }) => {
  const { account } = useStateSelector(({ auth }) => auth);
  const { removeClaim } = useLystItemActions(lystItem.wishlystId, lystItem.id);

  const onDeleteClaim = () => {
    if (!account) return;
    removeClaim(account.uid, account.isAnonymous);
    onClose();
  };

  return (
    <Modal title="Remove claim" onClose={onClose}>
      <Heading level={5}>Are you sure you want to remove your claim of this item?</Heading>
      <Button primary label="Remove claim" onClick={onDeleteClaim} />
    </Modal>
  );
};

export default UnclaimModal;
