import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { firestore } from "firebase/app";
import { Text, Box, Button } from "grommet";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { ILyst, ILystItem, EFetchStatus } from "../store/types";
import LystHeader from "./lyst-header";
import { orderedLystItemsSelector } from "../selectors";
import useLystItemActions from "../hooks/use-lyst-item-actions";
import { fetchItemSuccess, removeItem, setOrderForLyst } from "../store/lyst-items";
import { useStateSelector } from "../store";
import EditableLystItemModal, { LystItemFormFields } from "./editable-lyst-item-modal";
import { CategoriesContext } from "../context/categories";
import LystItemCardGridLayout from "./lyst-item-card-grid-layout";
import EditableClaimItemModal from "./editable-claim-item-modal";
import Modal from "./modal";

interface IProps {
  lyst: ILyst;
  onFilter?: () => any;
  lystItems: ILystItem[];
  hasFetched?: boolean;
}

const ListDetail: FC<IProps> = ({ lyst, onFilter, lystItems, hasFetched }) => {
  const viewModeLocalStorageKey = "wishlyst@edit_view_mode";
  const history = useHistory();
  const { current: db } = useRef(firestore());

  const account = useStateSelector(({ auth }) => auth.account);
  const { claimForUser, anonymousClaim, removeClaim } = useLystItemActions(lyst.id);

  const [editModalId, setEditModalId] = useState<string | void>();
  const [claimModalItemId, setClaimModalItemId] = useState<string | void>();
  const [viewMoreOptions, setViewMoreOptions] = useState(false);

  const isLystOwner = !!account && account.uid === lyst._private.owner;
  const lystRef = db.doc(`/lysts/${lyst.id}`);
  const lystItemsRef = lystRef.collection(`lystItems`);

  const updateLystData = (values: Partial<ILyst>) => lystRef.update(values);
  const addNewItem = () => setEditModalId(lystItemsRef.doc().id);

  const onDeleteLyst = () => {
    const deleteConfirmed = window.confirm("Are you sure you want to delete this wishlyst?");
    if (deleteConfirmed) {
      lystRef.delete();
      history.push("/lysts");
    }
  };

  const onEditLystItemModalSave = (values: Partial<LystItemFormFields>) => {
    if (!editModalId) return;

    const unsubscribe = lystItemsRef.doc(editModalId).onSnapshot(snap => {
      if (snap.exists) snap.ref.update(values);
      else snap.ref.set({ ...values, createdAt: firestore.Timestamp.now() });
      unsubscribe();
    });
  };

  const claimAsUnregisteredUser = ({ userId, displayName }: { userId: string; displayName?: string }, quantity: number = 1) => {
    if (!claimModalItemId) return console.error("claimModalItemId is not set");
    anonymousClaim(claimModalItemId, quantity, userId, displayName)();
  };

  const claimAsRegisteredUser = (userId: string, quantity: number = 1) => {
    if (!claimModalItemId) return console.error("claimModalItemId is not set");
    claimForUser(claimModalItemId, quantity, userId)();
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
      {claimModalItemId && (
        <EditableClaimItemModal
          onClose={() => setClaimModalItemId()}
          onAnonymousClaim={claimAsUnregisteredUser}
          onSelectClaimUser={claimAsRegisteredUser}
          lystItemId={claimModalItemId}
          onRemoveClaim={(claimantId, isAnonymous) => removeClaim(claimantId, isAnonymous, claimModalItemId)}
        />
      )}
      {viewMoreOptions && (
        <Modal title="More options" onClose={() => setViewMoreOptions(false)}>
          <Button primary color="status-critical" label="DELETE THIS WISHLYST" onClick={onDeleteLyst} />
        </Modal>
      )}
    </>
  );
};

export default ListDetail;
