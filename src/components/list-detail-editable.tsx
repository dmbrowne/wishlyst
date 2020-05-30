import React, { FC, useState } from "react";
import { Text, Box, Button } from "grommet";
import { useHistory } from "react-router-dom";

import { ILyst, ILystItem, ILystItemFormFields } from "../@types";
import { useStateSelector } from "../store";
import { db } from "../firebase";
import LystHeader from "./lyst-header";
import EditableLystItemModal from "./editable-lyst-item-modal";
import LystItemCardGridLayout from "./lyst-item-card-grid-layout";
import EditableClaimItemModal from "./editable-claim-item-modal";
import Modal from "./modal";
import { firestore } from "firebase/app";

interface IProps {
  lyst: ILyst;
  onFilter?: () => any;
  lystItems: ILystItem[];
  hasFetched?: boolean;
}

const ListDetail: FC<IProps> = ({ lyst, onFilter, lystItems, hasFetched }) => {
  const history = useHistory();
  const account = useStateSelector(({ auth }) => auth.account);

  const [editModalId, setEditModalId] = useState<string | void>();
  const [claimModalItemId, setClaimModalItemId] = useState<string | void>();
  const [viewMoreOptions, setViewMoreOptions] = useState(false);

  const isLystOwner = !!account && account.uid === lyst._private.owner;
  const lystRef = db.doc(`/lysts/${lyst.id}`);
  const lystItemsRef = db.collection(`lystItems`);

  const updateLystData = (values: Partial<ILyst>) => lystRef.update(values);
  const addNewItem = () => setEditModalId(lystItemsRef.doc().id);

  const onDeleteLyst = () => {
    const deleteConfirmed = window.confirm("Are you sure you want to delete this wishlyst?");
    if (deleteConfirmed) {
      lystRef.delete();
      history.push("/app/wishlysts");
    }
  };

  const onEditLystItemModalSave = (values: ILystItemFormFields) => {
    if (!editModalId) return;

    return db.runTransaction(async transaction => {
      const lystItemRef = db.doc(`lystItems/${editModalId}`) as firestore.DocumentReference<Omit<ILystItem, "id">>;
      const lystItemSnapshot = await transaction.get(lystItemRef);
      const newItemData = {
        ...values,
        wishlystId: lyst.id,
        totalClaimed: 0,
        createdAt: firestore.Timestamp.now(),
      };
      console.log(newItemData);
      if (lystItemSnapshot.exists) transaction.update(lystItemRef, values);
      else {
        transaction.set<Omit<ILystItem, "id">>(lystItemRef, newItemData);
      }
    });
  };

  return (
    <>
      <Box align="center">
        <LystHeader lyst={lyst} editable={isLystOwner} onUpdateDetails={updateLystData} onMore={() => setViewMoreOptions(true)} />
      </Box>

      {lystItems.length > 0 && (
        <Box margin={{ top: "large" }}>
          <LystItemCardGridLayout
            isOwner={true}
            lystItems={lystItems}
            onAddItem={addNewItem}
            onClaim={setClaimModalItemId}
            onView={setEditModalId}
            onFilter={onFilter}
          />
        </Box>
      )}
      {lystItems.length === 0 && isLystOwner && hasFetched && (
        <Box align="center" width="100%" margin={{ top: "xlarge" }}>
          <Text textAlign="center" margin={{ bottom: "small" }} children="No items on this list" />
          <Button label="Add one" onClick={() => addNewItem()} />
        </Box>
      )}
      {editModalId && (
        <EditableLystItemModal
          lystItemId={editModalId}
          onSave={onEditLystItemModalSave}
          uploadImgPath={`lysts/${lyst.id}/lystItem_${editModalId}`}
          onClose={() => setEditModalId()}
          onDelete={() => {
            setEditModalId();
            lystItemsRef.doc(editModalId).delete();
          }}
        />
      )}
      {claimModalItemId && <EditableClaimItemModal onClose={() => setClaimModalItemId()} lystItemId={claimModalItemId} />}
      {viewMoreOptions && (
        <Modal title="More options" onClose={() => setViewMoreOptions(false)}>
          <Button primary color="status-critical" label="DELETE THIS WISHLYST" onClick={onDeleteLyst} />
        </Modal>
      )}
    </>
  );
};

export default ListDetail;
