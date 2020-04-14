import { GuestProfileContext } from "../context/guest-profile";
import { useContext, useRef } from "react";
import { ILystItem } from "../store/types";
import { firestore } from "firebase/app";
import { AuthContext } from "../context/auth";
import { IClaimedItem } from "../store/types";

const useLystItemActions = (lystId: string, lystItemId?: string) => {
  const { current: db } = useRef(firestore());
  const { account, user } = useContext(AuthContext);
  const { updateGuestProfile } = useContext(GuestProfileContext);
  const lystRef = db.doc(`/lysts/${lystId}`);
  const lystItemsRef = lystRef.collection(`lystItems`);

  const updateGuestClaimedAndLystInfo = (lystIncrement: number, lystItem: { id: string; path: string; increment: number }) => {
    updateGuestProfile(guestProfile => ({
      ...guestProfile,
      lysts: {
        ...(guestProfile?.lysts || {}),
        [lystId]: (guestProfile?.lysts?.[lystId] || 0) + lystIncrement,
      },
      claimedItems: {
        ...(guestProfile?.claimedItems || {}),
        [lystItem.id]: {
          lystItemRef: lystItem.path,
          lystId,
          quantity: (guestProfile.claimedItems?.[lystItem.id]?.quantity || 0) + lystItem.increment || 0,
          claimedAt: firestore.Timestamp.now(),
        },
      },
    }));
  };

  const claim = (listItemId?: string, quantity = 1) => {
    const itemId = listItemId || lystItemId;
    if (!itemId) {
      throw Error("lystItem must be provived to the hook or in the claim function");
    }
    if (!account) return;

    const { uid, displayName, isAnonymous } = account;
    const annonUserRef = lystRef.collection("anonymousUsers").doc(uid);
    const lystItemRef = lystItemsRef.doc(itemId);

    db.runTransaction(transaction => {
      const updateLystItemClaimants = (doc: firestore.DocumentSnapshot<firestore.DocumentData>, accountId: string, quantity: number) => {
        transaction.update(doc.ref, {
          claimants: [...((doc.data() as ILystItem)?.claimants || []), ...new Array(quantity).fill(accountId)],
        });
      };
      if (user) {
        const userRef = db.doc(`users/${user.id}`);
        const userClaimedItemsRef = userRef.collection("claimedItems").doc(itemId);
        return Promise.all([transaction.get(lystItemRef), transaction.get(userRef), transaction.get(userClaimedItemsRef)]).then(
          ([lystItemDoc, userDoc, userLystItemDoc]) => {
            if (!lystItemDoc.exists) throw Error("lystItem does not exist!");
            const data = lystItemDoc.data() as Omit<ILystItem, "id">;
            if ((data.claimants?.length || 0) >= data.quantity) throw Error("Race condition: Someone else has just claimed this item");

            transaction.update(lystItemDoc.ref, {
              claimants: [...((lystItemDoc.data() as ILystItem)?.claimants || []), ...new Array(quantity).fill(account.uid)],
            });
            updateLystItemClaimants(lystItemDoc, account.uid, quantity);
            transaction.update(userDoc.ref, { [`lysts.${itemId}`]: firestore.FieldValue.increment(quantity) });
            transaction.update(userLystItemDoc.ref, { lystItemRef, lystId, quantity: firestore.FieldValue.increment(quantity) });
          }
        );
      } else {
        return Promise.all([transaction.get(lystItemRef), transaction.get(annonUserRef)]).then(([lystItemDoc, annonUser]) => {
          if (!lystItemDoc.exists) throw Error("lystItem does not exist!");
          const data = lystItemDoc.data() as Omit<ILystItem, "id">;
          if ((data.claimants?.length || 0) >= data.quantity) throw Error("Race condition: Someone else has just claimed this item");

          updateLystItemClaimants(lystItemDoc, account.uid, quantity);
          if (isAnonymous) {
            if (!annonUser.exists) transaction.set(annonUserRef, { displayName });
            updateGuestClaimedAndLystInfo(1, { path: lystItemRef.path, increment: quantity, id: itemId });
          }
        });
      }
    });
  };

  const createItem = (values: Partial<ILystItem> = {}) => {
    if (values.id) {
      lystItemsRef.doc(values.id).set({ ...values, createdAt: firestore.Timestamp.now() });
    } else {
      const newItem: Omit<ILystItem, "id"> = { name: "", quantity: 1, ...values, createdAt: firestore.Timestamp.now() };
      lystItemsRef.add(newItem);
    }
  };
  const updateItem = (id: string) => (keyValue: { [fieldName: string]: any }) => lystItemsRef.doc(id).update(keyValue);
  const deleteItem = (id: string, itemName?: string) => {
    const confirmedDelete = window.confirm(`Are you sure you want to delete ${itemName || "this item"}?`);
    if (confirmedDelete) lystItemsRef.doc(id).delete();
  };

  const removeClaim = (lystItemId: string, quantity = 1) => {
    if (!account) return;

    firestore().runTransaction(transaction => {
      const lystItemRef = lystItemsRef.doc(lystItemId);

      if (user) {
        const userRef = db.doc(`users/${user.id}`);
        const userClaimedItemsRef = userRef.collection("claimedItems").doc(lystItemId);

        return Promise.all([transaction.get(lystItemRef), transaction.get(userRef), transaction.get(userClaimedItemsRef)]).then(
          ([doc, userDoc, userLystItemDoc]) => {
            const claimants = (doc.data() as ILystItem).claimants || [];
            new Array(quantity).fill(undefined).forEach(() => {
              const occurence = claimants.findIndex(claimantUserId => claimantUserId === account.uid);
              if (occurence >= 0) claimants.splice(occurence, 1);
            });

            transaction.update(doc.ref, { claimants });
            transaction.update(userDoc.ref, { [`lysts.${lystItemId}`]: firestore.FieldValue.increment(-Math.abs(quantity)) });
            const claimedItems = userLystItemDoc.data() as IClaimedItem;
            if (claimedItems.quantity < 2) transaction.delete(userLystItemDoc.ref);
            else transaction.update(userLystItemDoc.ref, { quantity: firestore.FieldValue.increment(-Math.abs(quantity)) });
          }
        );
      } else {
        return transaction.get(lystItemsRef.doc(lystItemId)).then(doc => {
          const claimants = (doc.data() as ILystItem).claimants || [];
          new Array(quantity).fill(undefined).forEach(() => {
            const occurence = claimants.findIndex(claimantUserId => claimantUserId === account.uid);
            if (occurence >= 0) claimants.splice(occurence, 1);
          });
          transaction.update(doc.ref, { claimants });

          updateGuestProfile(guestProfile => {
            let claimedItems = { ...(guestProfile?.claimedItems || {}) };
            const claimedItem = (claimedItems[lystItemId] as IClaimedItem) || undefined;
            if (claimedItem) {
              if (claimedItem.quantity < 2) delete claimedItems[lystItemId];
              else {
                claimedItem.quantity = claimedItem.quantity - Math.abs(quantity);
                claimedItems = { ...claimedItems, [lystItemId]: claimedItem };
              }
            }
            return {
              ...guestProfile,
              lysts: {
                ...(guestProfile?.lysts || {}),
                [lystId]: (guestProfile?.lysts?.[lystId] || 0) - 1 || 0,
              },
              claimedItems,
            };
          });
        });
      }
    });
  };

  return {
    claim,
    createItem,
    updateItem,
    deleteItem,
    removeClaim,
  };
};

export default useLystItemActions;
