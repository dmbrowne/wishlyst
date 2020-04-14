import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { firestore } from "firebase/app";
import { Heading, Text, Box, Button, Tabs, Tab } from "grommet";
import qs from "query-string";

import { AuthContext } from "../context/auth";
import StandardLayout from "../layouts/standard";
import { ReactComponent as GiftsImg } from "../icons/gifts.svg";
import LystHeader from "./lyst-header";
import { ICategory } from "../@types";
import { orderedLystItemsSelector } from "../selectors";
import GridListing from "../styled-components/grid-listing";
import LystItemClaimCard from "./lyst-item-claim-card";
import ClaimItemModal from "./claim-item-modal";
import useLystItemActions from "../hooks/use-lyst-item-actions";
import GuestClaimedItems from "./guest-claimed-items";
import Spinner from "./spinner";
import { ILystItem, ILyst } from "../store/types";
import { useStateSelector } from "../store";
import { useDispatch } from "react-redux";
import { fetchItemSuccess, removeItem, setOrderForLyst } from "../store/lyst-items";
import ClaimedLystItemsGuestListing from "./claimed-lyst-items-guest-listing";
import ClaimedLystItemsUserListing from "./claimed-lyst-items-user-listing";
import { useLocation, useHistory, useRouteMatch } from "react-router-dom";
import useUserClaimedItems from "../hooks/use-user-claimed-items";
import Modal from "./modal";
import UnauthenticatedClaimModalContent from "./unauthenticated-claim-modal-content";

interface IProps {
  lyst: ILyst;
  categories: ICategory[];
  anonymousUsers: {
    [uid: string]: string; //uid
  };
}

const ListDetail: FC<IProps> = ({ lyst, categories }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const match = useRouteMatch();
  const queryMap = qs.parse(location.search);

  const { current: db } = useRef(firestore());
  const { account, user } = useContext(AuthContext);

  const lystRef = db.doc(`/lysts/${lyst.id}`);
  const lystItemsRef = lystRef.collection(`lystItems`);

  // lystItem listeners started from the 'mine' lystMode
  const [individualUnsubscribers, setIndividualUnsubscribers] = useState<(() => void)[]>([]);
  const [claimModalItem, setClaimModalItem] = useState<ILystItem | void>();
  const [viewMode, setViewMode] = useState(queryMap.view || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [bookmarkLogin, setBookmarkLogin] = useState(false);

  const lystItems = useStateSelector(orderedLystItemsSelector);
  const { claim, removeClaim } = useLystItemActions(lyst.id);
  const { loadMore, hasMore, items } = useUserClaimedItems(lyst.id, selectedCategories);

  useEffect(() => () => individualUnsubscribers.forEach(unsubscribe => unsubscribe()), []);

  useEffect(() => {
    let q: firestore.Query<firestore.DocumentData> | firestore.CollectionReference<firestore.DocumentData> = lystItemsRef;

    if (selectedCategories && selectedCategories.length) {
      q = q.where("categoryId", "in", selectedCategories);
    }

    return q.orderBy("createdAt", "asc").onSnapshot(snapshot => {
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
    });
  }, [selectedCategories]);

  const onChangeTab = (idx: number) => {
    history.replace(`${match.url}?${qs.stringify({ ...queryMap, view: idx === 0 ? "all" : "mine" })}`);
    setViewMode(idx === 0 ? "all" : "mine");
  };

  const selectCategory = (categoryId: string) => {
    const cats = [...selectedCategories];
    const existingIdx = selectedCategories.indexOf(categoryId);

    if (existingIdx >= 0) cats.splice(existingIdx, 1);
    else cats.push(categoryId);

    setSelectedCategories(cats);
  };

  const updateBookmark = (save: boolean) => {
    if (!user) {
      setBookmarkLogin(true);
      return;
    }
    // const save = user.bookmarked?.includes(lyst.id);
    const operation = save ? firestore.FieldValue.arrayUnion : firestore.FieldValue.arrayRemove;
    db.doc(`users/${user.id}`).update({ bookmarked: operation(lyst.id) });
  };

  const showCategories = (account && account.isAnonymous) || viewMode !== "mine";

  return (
    <StandardLayout>
      <Box align="center">
        <LystHeader
          lyst={lyst}
          saveOptions={{
            isSaved: user?.bookmarked?.includes(lyst.id) || false,
            onToggle: () => updateBookmark(user?.bookmarked?.includes(lyst.id) || false),
          }}
        />
      </Box>
      <Box>
        <Tabs margin={{ top: "large" }} onActive={onChangeTab}>
          <Tab title="All items" style={viewMode !== "mine" ? { fontWeight: 700 } : {}} />
          <Tab title="Items claimed by me" style={viewMode === "mine" ? { fontWeight: 700 } : {}} />
        </Tabs>
      </Box>
      {showCategories && (
        <Box direction="row" gap="medium" margin={{ top: "medium" }}>
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
        <Box margin={{ top: "large" }}>
          <GridListing>
            {viewMode === "mine" ? (
              account ? (
                account.isAnonymous ? (
                  <ClaimedLystItemsGuestListing
                    lystId={lyst.id}
                    onStartListener={unsubscribe => setIndividualUnsubscribers([...individualUnsubscribers, unsubscribe])}
                    onClaim={lystItem => (lystItem.quantity > 1 || !account ? setClaimModalItem(lystItem) : claim(lystItem.id))}
                    onRemoveClaim={removeClaim}
                  />
                ) : (
                  <ClaimedLystItemsUserListing
                    loadMore={loadMore}
                    hasMore={hasMore}
                    items={items}
                    lystId={lyst.id}
                    onClaim={lystItem => (lystItem.quantity > 1 || !account ? setClaimModalItem(lystItem) : claim(lystItem.id))}
                    onRemoveClaim={removeClaim}
                  />
                )
              ) : (
                <Text>Please sign in to view your claimed items</Text>
              )
            ) : (
              lystItems.map(lystItem => (
                <LystItemClaimCard
                  key={lystItem.id}
                  lystItem={lystItem}
                  claimed={(lystItem.claimants && lystItem.claimants.length >= lystItem.quantity) || false}
                  onClaim={() => (lystItem.quantity > 1 || !account ? setClaimModalItem(lystItem) : claim(lystItem.id))}
                  onRemoveClaim={
                    account && lystItem.claimants?.includes(account.uid) ? quantity => removeClaim(lystItem.id, quantity) : undefined
                  }
                />
              ))
            )}
          </GridListing>
        </Box>
      )}
      {lystItems.length === 0 && (
        <Box align="center" width="100%" margin={{ top: "large" }}>
          <Heading level={4} textAlign="center">
            <em>No items added to this list yet</em>
          </Heading>
          <Box width={{ max: "800px" }} margin={{ top: "large" }} style={{ width: "100%" }}>
            <Text as="span" color="dark-6">
              <GiftsImg />
            </Text>
          </Box>
        </Box>
      )}
      {bookmarkLogin && (
        <Modal title="Login or register to save this wishlyst" onClose={() => setBookmarkLogin(false)}>
          <UnauthenticatedClaimModalContent showGuestSection={false} />
        </Modal>
      )}
      {claimModalItem && (
        <ClaimItemModal
          lystItem={claimModalItem}
          onClaim={quantity => {
            claim(claimModalItem.id, quantity);
            setClaimModalItem();
          }}
          onClose={() => setClaimModalItem()}
        />
      )}
    </StandardLayout>
  );
};

export default ListDetail;
