import React, { FC, useEffect, useState } from "react";
import { firestore } from "firebase/app";
import { Heading, Text, Box, Paragraph } from "grommet";
import qs from "query-string";

import LystHeader from "./lyst-header";
import ClaimItemModal from "./claim-item-modal";
import { ILystItem, ILyst } from "../@types";
import { useStateSelector } from "../store";
import { useStore } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import Modal from "./modal";
import UnauthenticatedClaimModalContent from "./unauthenticated-claim-modal-content";
import FirebaseImage from "./firebase-image";
import SObjectFitImage from "../styled-components/object-fit-image";
import LystItemCardGridLayout from "./lyst-item-card-grid-layout";
import { IRootReducer } from "../store/combined-reducers";
import { db } from "../firebase";
import UnclaimModal from "./unclaim-modal";

interface IProps {
  lyst: ILyst;
  onFilter?: () => any;
  lystItems: ILystItem[];
}

const ListDetail: FC<IProps> = ({ lyst, onFilter, lystItems }) => {
  const location = useLocation();
  const history = useHistory();
  const store = useStore<IRootReducer>();
  const queryMap = qs.parse(location.search);

  const [unclaimModalItem, setUnclaimModalItem] = useState<ILystItem | void>();
  const [claimModalItem, setClaimModalItem] = useState<ILystItem | void>();
  const [viewLystItem, setViewLystItem] = useState<ILystItem | void>();
  const [bookmarkLogin, setBookmarkLogin] = useState(false);
  const { account, user } = useStateSelector(({ auth }) => auth);

  useEffect(() => {
    if (queryMap.claim && account) {
      const lystItem = lystItems.find(item => item.id === queryMap.claim);
      if (!lystItem) return;
      const amountClaimed = lystItem.totalClaimed || 0;
      if (amountClaimed === lystItem.quantity) return;
      setClaimModalItem(lystItem);
    }
  }, [account, lystItems, queryMap.claim]);

  const updateBookmark = (save: boolean) => {
    if (!user) return setBookmarkLogin(true);
    const operation = save ? firestore.FieldValue.arrayUnion : firestore.FieldValue.arrayRemove;
    db.doc(`users/${user.id}`).update({ bookmarked: operation(lyst.id) });
  };

  const closeClaimModal = () => {
    setClaimModalItem();
    const queryString = { ...queryMap };
    if (queryString.claim) {
      delete queryString.claim;
      const query = qs.stringify(queryString) || "";
      history.replace(location.pathname + `?${query}`);
    }
  };

  const onClaim = (itemId: string) => {
    const lystItem = store.getState().lystItems.allItems[itemId];
    if (!lystItem) return;
    setClaimModalItem(lystItem);
  };

  const onView = (itemId: string) => {
    const lystItem = store.getState().lystItems.allItems[itemId];
    if (!lystItem) return;
    setViewLystItem(lystItem);
  };

  const onRemoveClaim = (itemId: string) => {
    const lystItem = store.getState().lystItems.allItems[itemId];
    const { buyerIds } = lystItem;
    if (!account || !lystItem) return;
    if (buyerIds && buyerIds.includes(account.uid)) setUnclaimModalItem(lystItem);
  };

  return (
    <>
      <Box align="center">
        <LystHeader
          lyst={lyst}
          saveOptions={{
            isSaved: user?.bookmarked?.includes(lyst.id) || false,
            onToggle: () => updateBookmark(user?.bookmarked?.includes(lyst.id) || false),
          }}
        />
      </Box>
      {lystItems.length > 0 && (
        <Box margin={{ top: "large" }}>
          <LystItemCardGridLayout
            isOwner={false}
            lystItems={lystItems}
            onClaim={onClaim}
            onView={onView}
            onFilter={onFilter}
            onRemoveClaim={onRemoveClaim}
          />
        </Box>
      )}
      {lystItems.length === 0 && (
        <Box align="center" width="100%" margin={{ top: "large" }}>
          <Heading level={4} textAlign="center">
            <em>No items added to this list yet</em>
          </Heading>
        </Box>
      )}
      {bookmarkLogin && (
        <Modal title="Login or register to save this wishlyst" onClose={() => setBookmarkLogin(false)}>
          <UnauthenticatedClaimModalContent showGuestSection={false} />
        </Modal>
      )}
      {claimModalItem && <ClaimItemModal lystItem={claimModalItem} onClose={closeClaimModal} />}
      {unclaimModalItem && <UnclaimModal lystItem={unclaimModalItem} onClose={() => setUnclaimModalItem()} />}
      {viewLystItem && (
        <Modal title="Item details" onClose={() => setViewLystItem()}>
          {viewLystItem.thumb ? (
            <FirebaseImage imageRef={viewLystItem.thumb}>{url => <SObjectFitImage src={url} />}</FirebaseImage>
          ) : (
            <Box background="light-6" pad="large" align="center" justify="center" children={<Text>No Image</Text>} />
          )}
          <Heading level={5} children={viewLystItem.name} />
          <Paragraph children={viewLystItem.description} />
        </Modal>
      )}
    </>
  );
};

export default ListDetail;
