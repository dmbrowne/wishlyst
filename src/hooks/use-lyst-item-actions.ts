import { IBuyer, IUser } from "./../store/types";
import { getAmountClaimed } from "./../store/index";
import { GuestProfileContext } from "../context/guest-profile";
import { useContext, useRef } from "react";
import { ILystItem } from "../store/types";
import { firestore } from "firebase/app";
import { AuthContext } from "../context/auth";
import { IClaimedItem } from "../store/types";
import { useStateSelector } from "../store";

const useLystItemActions = (lystId: string, lystItemId?: string) => {
  const { current: db } = useRef(firestore());
  const { account } = useStateSelector(({ auth }) => auth);
  const { updateGuestProfile } = useContext(GuestProfileContext);
  const lystRef = db.doc(`/lysts/${lystId}`);
  const lystItemsRef = lystRef.collection(`lystItems`);

  const updateGuestClaimedAndLystInfo = (increment: number | null, lystItem: { id: string; path: string }) => {
    updateGuestProfile(guestProfile => {
      const lysts = { ...(guestProfile?.lysts || {}) };
      const claimedItems = { ...(guestProfile?.claimedItems || {}) };

      if (increment === null) {
        delete lysts[lystId];
        delete claimedItems[lystId];
      } else {
        const lystCount = (lysts[lystId] || 0) + increment;
        lysts[lystId] = lystCount || 0;
        claimedItems[lystItem.id] = {
          lystId,
          lystItemRef: lystItem.path,
          quantity: ((claimedItems[lystItem.id] && claimedItems[lystItem.id].quantity) || 0) + increment || 0,
          claimedAt: firestore.Timestamp.now(),
        };
      }

      return { ...guestProfile, lysts, claimedItems };
    });
  };

  const checkLystItemCanBeIncremented = (lystItemDoc: firestore.DocumentSnapshot, increment: number) => {
    const data = lystItemDoc.data() as Omit<ILystItem, "id">;
    if (!lystItemDoc.exists) throw Error("lystItem does not exist!");
    const claimedCount = getAmountClaimed(data.buyers);
    if (claimedCount >= data.quantity && increment > 0) {
      throw Error("This item has reached it max claim amount");
    }
  };

  const updateClaimantsList = (
    lystItem: Omit<ILystItem, "id"> & { id?: string },
    user: { userId: string; displayName: string; isAnonymous: boolean },
    increment: number | null
  ) => {
    const { userId, displayName, isAnonymous } = user;
    const currentBuyers = lystItem.buyers || {};
    const currentBuyByUser = currentBuyers[userId] ? currentBuyers[userId] : null;

    if (increment === null) return removeBuysByUser();

    if (currentBuyByUser) {
      const newCount = currentBuyByUser.count + increment;
      if (newCount < 1) return removeBuysByUser();
      currentBuyByUser.count = currentBuyByUser.count + increment;
      currentBuyByUser.displayName = displayName;
      return { ...currentBuyers, [userId]: currentBuyByUser };
    } else {
      const buyDetails: IBuyer = {
        count: !increment ? 0 : increment,
        displayName,
        userId,
        useDefaultName: true,
        isAnonymous,
      };

      return { ...currentBuyers, [userId]: buyDetails };
    }

    function removeBuysByUser() {
      return Object.entries(currentBuyers).reduce((accum, [id, buyer]) => {
        if (id !== userId) return { ...accum, [id]: buyer };
        else return accum;
      }, {} as { [userId: string]: IBuyer });
    }
  };

  const claimForUser = (itemId: string, increment: number | null, claimantId: string, displayName?: string) => (
    transaction?: firestore.Transaction
  ) => {
    const userRef = db.doc(`users/${claimantId}`);
    const userClaimedItemsRef = userRef.collection("claimedItems").doc(itemId);
    const lystItemRef = lystItemsRef.doc(itemId);

    if (transaction) return performClaim(transaction);
    else return db.runTransaction(performClaim);

    function performClaim(transActn: firestore.Transaction) {
      const transactionFetches = [lystItemRef, userRef, userClaimedItemsRef].map(ref => transActn.get(ref));
      const { FieldValue } = firestore;

      return Promise.all(transactionFetches).then(([lystItemDoc, userDoc, userLystItemDoc]) => {
        const user = userDoc.data() as Omit<IUser, "id">;
        const lystItemdata = lystItemDoc.data() as Omit<ILystItem, "id">;

        if (increment) {
          checkLystItemCanBeIncremented(lystItemDoc, increment);
        }

        const buyer = { userId: claimantId, displayName: displayName || user.displayName, isAnonymous: false };
        const updatedBuyers = updateClaimantsList(lystItemdata, buyer, increment);
        const shouldDelete = !updatedBuyers[claimantId];

        transActn.update(lystItemDoc.ref, { buyers: updatedBuyers });
        transActn.update(userDoc.ref, {
          [`lysts.${lystId}`]: shouldDelete || increment === null ? FieldValue.delete() : FieldValue.increment(increment),
        });

        if (typeof increment === "number") {
          if (userLystItemDoc.exists) {
            transActn.update(userLystItemDoc.ref, { lystItemRef, lystId, quantity: FieldValue.increment(increment) });
          } else {
            transActn.set(userLystItemDoc.ref, { lystItemRef, lystId, quantity: FieldValue.increment(increment) });
          }
        }
      });
    }
  };

  const anonymousClaim = (itemId: string, increment: number | null, claimantId: string, displayName?: string) => (
    transaction?: firestore.Transaction
  ) => {
    const annonUserRef = lystRef.collection("anonymousUsers").doc(claimantId);
    const lystItemRef = lystItemsRef.doc(itemId);

    if (transaction) return performClaim(transaction);
    else return db.runTransaction(performClaim);

    function performClaim(transActn: firestore.Transaction) {
      const transactionFetches = [lystItemRef, annonUserRef].map(ref => transActn.get(ref));

      return Promise.all(transactionFetches).then(([lystItemDoc, annonUser]) => {
        const currentDisplayName = annonUser.exists ? (annonUser.data() as IUser).displayName : undefined;
        const updatedDisplayName = displayName || currentDisplayName;

        if (!updatedDisplayName) {
          throw Error("A displayName must be provided if anonymous user does not exist");
        }

        const lystItemdata = lystItemDoc.data() as Omit<ILystItem, "id">;
        if (increment) checkLystItemCanBeIncremented(lystItemDoc, increment);
        const buyer = { userId: claimantId, displayName: updatedDisplayName, isAnonymous: true };
        const updatedBuyers = updateClaimantsList(lystItemdata, buyer, increment);

        if (!annonUser.exists) {
          if (!displayName) throw Error("anonymous user does not exist, a displayName must be provided to create an anonymous user");
          transActn.set(annonUserRef, { displayName });
        }

        transActn.update(lystItemRef, { buyers: updatedBuyers });
        updateGuestClaimedAndLystInfo(increment, { path: lystItemRef.path, id: itemId });
      });
    }
  };

  const claim = (listItemId?: string, quantity = 1) => {
    const itemId = listItemId || lystItemId;
    if (!itemId) throw Error("lystItem must be provived to the hook or in the claim function");
    if (!account) throw Error("current user needs to be authenticated to perform this action");
    const { uid, displayName, isAnonymous } = account;
    if (!displayName) throw Error("displayName required");
    const doClaim = !isAnonymous ? claimForUser(itemId, quantity, uid) : anonymousClaim(itemId, quantity, uid, displayName);
    doClaim();
  };

  const removeClaim = (claimantId: string, isAnonymous: boolean, listItemId?: string) => {
    const itemId = listItemId || lystItemId;
    if (!itemId) throw Error("lystItem must be provived to the hook or in the claim function");
    if (!account) throw Error("current user needs to be authenticated to perform this action");
    const deleteClaim = isAnonymous ? anonymousClaim(itemId, null, claimantId) : claimForUser(itemId, null, claimantId);
    deleteClaim();
  };

  const createItem = (values: Partial<ILystItem> = {}) => {
    const defaultValues = { name: "", url: "", description: "", quantity: 1 };
    if (values.id) {
      lystItemsRef.doc(values.id).set({ ...defaultValues, ...values, createdAt: firestore.Timestamp.now() });
    } else {
      const newItem: Omit<ILystItem, "id"> = { ...defaultValues, createdAt: firestore.Timestamp.now() };
      lystItemsRef.add(newItem);
    }
  };
  const updateItem = (id: string) => (keyValue: { [fieldName: string]: any }) => lystItemsRef.doc(id).update(keyValue);
  const deleteItem = (id: string, itemName?: string) => {
    const confirmedDelete = window.confirm(`Are you sure you want to delete ${itemName || "this item"}?`);
    if (confirmedDelete) lystItemsRef.doc(id).delete();
  };

  return {
    claim,
    createItem,
    updateItem,
    deleteItem,
    removeClaim,
    claimForUser,
    anonymousClaim,
  };
};

export default useLystItemActions;
