import React, { FC, useState, useEffect } from "react";
import { ILystItem } from "../@types";
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
  const [currentClaimId, setCurrentClaimId] = useState<null | string>(null);
  const { removeClaim, getUserClaimSnapshot } = useLystItemActions(lystItem.wishlystId, lystItem.id);

  useEffect(() => {
    getAndSetUserClaim();

    async function getAndSetUserClaim() {
      if (!account) return;
      const snap = await getUserClaimSnapshot(account.uid);
      if (snap) setCurrentClaimId(snap.id);
    }
  }, [account, getUserClaimSnapshot]);

  const onDeleteClaim = () => {
    if (currentClaimId) {
      removeClaim(currentClaimId);
    }
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
