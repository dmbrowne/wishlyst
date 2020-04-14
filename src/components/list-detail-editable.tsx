import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { firestore } from "firebase/app";
import { Heading, Text, Box, Button } from "grommet";
import { useDispatch } from "react-redux";

import { AuthContext } from "../context/auth";
import StandardLayout from "../layouts/standard";
import { ILyst, ILystItem, ICategory, EFetchStatus } from "../store/types";
import { ReactComponent as GiftsImg } from "../icons/gifts.svg";
import LystHeader from "./lyst-header";
import EditableLystItemCard from "./editable-lyst-item-card";
import { orderedLystItemsSelector } from "../selectors";
import GridListing from "../styled-components/grid-listing";
import LystItemClaimCard from "./lyst-item-claim-card";
import ClaimItemModal from "./claim-item-modal";
import useLystItemActions from "../hooks/use-lyst-item-actions";
import { fetchItemSuccess, removeItem, setOrderForLyst } from "../store/lyst-items";
import { useStateSelector } from "../store";
import { UnorderedList, Grid } from "grommet-icons";
import SRoundedCard from "../styled-components/rounded-card";
import FirebaseImage from "./firebase-image";
import getImgThumb, { EThumbSize } from "../utils/get-image-thumb";
import SObjectFitImage from "../styled-components/object-fit-image";
import EditableLystItemModal from "./editable-lyst-item-modal-content";
import Modal from "./modal";

interface IProps {
  lyst: ILyst;
  categories: ICategory[];
  anonymousUsers: {
    [uid: string]: string; //displayName
  };
}

const ListDetail: FC<IProps> = ({ lyst, categories }) => {
  const viewModeLocalStorageKey = "wishlyst@edit_view_mode";
  const { current: savedViewMode } = useRef(window.localStorage.getItem(viewModeLocalStorageKey));
  const { current: db } = useRef(firestore());
  const { account } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState<"list" | "grid">(savedViewMode === "list" || savedViewMode === "grid" ? savedViewMode : "list");
  const dispatch = useDispatch();
  const lystItems = useStateSelector(orderedLystItemsSelector);
  const { updateItem, deleteItem, createItem } = useLystItemActions(lyst.id);
  const [editModal, setEditModal] = useState<ILystItem | void>();
  const [newLystItem, setNewLystItemFlag] = useState(false);
  const [fetchStatus, setFetchStatus] = useState(EFetchStatus.initial);

  const isLystOwner = !!account && account.uid === lyst._private.owner;
  const lystRef = db.doc(`/lysts/${lyst.id}`);
  const lystItemsRef = lystRef.collection(`lystItems`);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    let q = lystItemsRef as firestore.CollectionReference<firestore.DocumentData> | firestore.Query<firestore.DocumentData>;

    if (selectedCategories && selectedCategories.length) {
      q = q.where("categoryId", "in", selectedCategories);
    }

    q.orderBy("createdAt", "asc").onSnapshot(
      snapshot => {
        snapshot.docChanges().forEach(({ type, doc }) => {
          if (type === "added" || type === "modified") dispatch(fetchItemSuccess({ id: doc.id, ...(doc.data() as ILystItem) }));
          if (type === "removed") dispatch(removeItem(doc.id));
        });
        dispatch(
          setOrderForLyst(
            lyst.id,
            snapshot.docs.map(doc => doc.id)
          )
        );
        setFetchStatus(EFetchStatus.success);
      },
      () => setFetchStatus(EFetchStatus.error)
    );
  }, [selectedCategories]);

  useEffect(() => {
    window.localStorage.setItem(viewModeLocalStorageKey, viewMode);
  }, [viewMode]);

  const selectCategory = (categoryId: string) => {
    const cats = [...selectedCategories];
    const existingIdx = selectedCategories.indexOf(categoryId);

    if (existingIdx >= 0) cats.splice(existingIdx, 1);
    else cats.push(categoryId);

    setSelectedCategories(cats);
  };

  const createCategory = (label: string) => {
    const categoryRef = lystRef.collection("categories").doc();
    categoryRef.set({ label });
    return { id: categoryRef.id, label };
  };

  const updateLystData = (values: Partial<ILyst>) => lystRef.update(values);

  const onCloseModal = () => {
    setEditModal();
    setNewLystItemFlag(false);
  };

  const saveNewLystItem = () => {
    if (editModal) createItem(editModal);
    setNewLystItemFlag(false);
  };

  const addNewItemViaModal = () => {
    const doc = lystItemsRef.doc();
    setEditModal({ id: doc.id, name: "", createdAt: firestore.Timestamp.now(), quantity: 1 });
    setNewLystItemFlag(true);
  };

  const editLayout = (lystItems: ILystItem[]) => (
    <Box align="center">
      {lystItems.map(lystItem => (
        <Box key={lystItem.id} width={{ max: "1024px" }} margin={{ vertical: "medium" }} style={{ width: "100%" }}>
          <EditableLystItemCard
            lystItem={lystItem}
            categories={categories}
            onUpdateLyst={updateItem(lystItem.id)}
            uploadImgPath={`lysts/${lyst.id}/lystItem_${lystItem.id}`}
            onDelete={() => deleteItem(lystItem.id)}
            onCreateCategory={createCategory}
          />
        </Box>
      ))}
      <Button label="Add another item" alignSelf="center" onClick={() => createItem()} margin={{ vertical: "large" }} />
    </Box>
  );

  const gridLayout = (lystItems: ILystItem[]) => (
    <Box>
      <Button label="Add another item" alignSelf="end" onClick={addNewItemViaModal} margin={{ bottom: "medium" }} />
      <GridListing>
        {lystItems.map(lystItem => (
          <SRoundedCard key={lystItem.id} onClick={() => setEditModal(lystItem)}>
            <Box height={{ max: "300px" }} style={{ height: "30vh" }}>
              {lystItem.thumb && (
                <FirebaseImage imageRef={getImgThumb(lystItem.thumb, EThumbSize.large)}>
                  {imgUrl => <SObjectFitImage src={imgUrl} />}
                </FirebaseImage>
              )}
            </Box>
            <Heading level={4} children={lystItem.name} margin={{ bottom: "xsmall" }} />
            <Text size="small" color="neutral-1" margin={{ bottom: "medium" }}>
              Quantity: {lystItem.quantity}
            </Text>
          </SRoundedCard>
        ))}
      </GridListing>
      <Button label="Add another item" alignSelf="center" onClick={addNewItemViaModal} margin={{ vertical: "large" }} />
    </Box>
  );

  return (
    <>
      <StandardLayout>
        <Box align="center">
          <LystHeader lyst={lyst} editable={isLystOwner} onUpdateDetails={updateLystData} />
        </Box>
        <Box direction="row" align="center" justify="center" margin={{ top: "large" }}>
          <Button icon={<UnorderedList />} primary={viewMode === "list"} onClick={() => setViewMode("list")} />
          <Button icon={<Grid />} primary={viewMode === "grid"} onClick={() => setViewMode("grid")} />
        </Box>
        {categories && (
          <Box direction="row" gap="medium" margin={{ top: "medium" }} justify={viewMode === "list" ? "center" : "start"}>
            {categories.map(category => (
              <Button
                key={category.id}
                primary={selectedCategories.includes(category.id)}
                label={category.label}
                color="dark-3"
                style={{ borderRadius: 20 }}
                onClick={() => selectCategory(category.id)}
              />
            ))}
          </Box>
        )}
        {lystItems.length > 0 && (
          <Box margin={{ top: "medium" }}>{viewMode === "grid" ? gridLayout(lystItems) : editLayout(lystItems)}</Box>
        )}
        {lystItems.length === 0 && isLystOwner && fetchStatus === EFetchStatus.success && (
          <Box align="center" width="100%" margin={{ top: "large" }}>
            <Heading level={4} textAlign="center">
              <em>No items added yet, add your first item</em>
            </Heading>
            <Button label="Add" onClick={() => createItem()} />
            <Box width={{ max: "800px" }} margin={{ top: "large" }} style={{ width: "100%" }}>
              <Text as="span" color="dark-6">
                <GiftsImg />
              </Text>
            </Box>
          </Box>
        )}
      </StandardLayout>
      {editModal && (
        <Modal
          title={newLystItem ? "Add new lyst item" : "Edit lyst item"}
          onClose={onCloseModal}
          primaryActions={[{ label: newLystItem ? "Save" : "Close", onClick: newLystItem ? saveNewLystItem : onCloseModal }]}
        >
          <EditableLystItemModal
            onClose={() => setEditModal()}
            lystItem={editModal}
            categories={categories}
            onUpdateLyst={updateItem(editModal.id)}
            uploadImgPath={`lysts/${lyst.id}/lystItem_${editModal.id}`}
            onCreateCategory={createCategory}
          />
        </Modal>
      )}
    </>
  );
};

export default ListDetail;
