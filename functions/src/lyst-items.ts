import { ILystItem, IUser, IBuyer, ILyst } from "./types";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface IClaimItemArgs {
  lystId: string;
  itemId: string;
  increment: number | null;
  claimantId: string;
  displayName?: string;
}

const getAmountClaimed = (buyers: ILystItem["buyers"]) => {
  const amountClaimed = Object.values(buyers || {}).reduce((total, { count }) => total + count, 0);
  return amountClaimed;
};

const checkLystItemCanBeIncremented = (lystItemDoc: admin.firestore.DocumentSnapshot, increment: number) => {
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
  increment: number | null,
  confirmed: boolean
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
      confirmed,
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

export const claimWishlystItem = functions.https.onCall(async (data: IClaimItemArgs, context) => {
  const db = admin.firestore();
  const { claimantId, lystId, itemId, increment, displayName } = data;
  const lystRef = db.doc(`/lysts/${lystId}`);
  const lystSnap = await lystRef.get();

  if (!lystSnap.exists) throw new functions.https.HttpsError("not-found", "the selected wishlyst doesn't exist");

  const isLystOwner = (lystSnap.data() as ILyst)._private.owner === context.auth?.uid;
  const claimantIsCurrentUser = context.auth?.uid === claimantId;

  if (!isLystOwner && !claimantIsCurrentUser) {
    throw new functions.https.HttpsError("permission-denied", "The current user doesn't have permission to update buyers on this item");
  }

  const lystItemsRef = lystRef.collection(`lystItems`);
  const userRef = db.doc(`users/${claimantId}`);
  const claimCollection = claimantIsCurrentUser ? "claimedItems" : "pendingClaims";
  const userClaimedItemsRef = userRef.collection(claimCollection).doc(itemId);
  const lystItemRef = lystItemsRef.doc(itemId);

  await db.runTransaction(transaction => {
    const transactionFetches = [lystItemRef, userRef, userClaimedItemsRef].map(ref => transaction.get(ref));
    const { FieldValue } = admin.firestore;

    return Promise.all(transactionFetches).then(([lystItemDoc, userDoc, userLystItemDoc]) => {
      const user = userDoc.data() as Omit<IUser, "id">;
      const lystItemdata = lystItemDoc.data() as Omit<ILystItem, "id">;

      if (increment) {
        try {
          checkLystItemCanBeIncremented(lystItemDoc, increment);
        } catch (e) {
          throw new functions.https.HttpsError("internal", e.message);
        }
      }

      const buyer = { userId: claimantId, displayName: displayName || user.displayName, isAnonymous: false };
      const updatedBuyers = updateClaimantsList(lystItemdata, buyer, increment, claimantIsCurrentUser);
      const shouldDelete = !updatedBuyers[claimantId];

      transaction.update(lystItemDoc.ref, { buyers: updatedBuyers });
      transaction.update(userDoc.ref, {
        [`lysts.${lystId}`]: shouldDelete || increment === null ? FieldValue.delete() : FieldValue.increment(increment),
      });

      if (typeof increment === "number") {
        if (userLystItemDoc.exists) {
          transaction.update(userLystItemDoc.ref, { lystItemRef, lystId, quantity: FieldValue.increment(increment) });
        } else {
          transaction.set(userLystItemDoc.ref, { lystItemRef, lystId, quantity: FieldValue.increment(increment) });
        }
      }
    });
  });
});

export const increaseClaimedLystItemsCount = functions.firestore
  .document("users/{userId}/claimedItems/{itemId}")
  .onCreate((doc, { params }) => {
    const { lystId } = doc.data() as any;
    if (!lystId) throw new Error("lystId does not exist on item");

    return admin
      .firestore()
      .doc(`/users/${params.userId}`)
      .update({
        [`lystItemsCount.${lystId}`]: admin.firestore.FieldValue.increment(1),
      });
  });

export const decreaseClaimedLystItemsCount = functions.firestore
  .document("users/{userId}/claimedItems/{itemId}")
  .onDelete((doc, { params }) => {
    const { lystId } = doc.data() as any;
    if (!lystId) throw new Error("lystId does not exist on item");

    return admin.firestore().runTransaction(async transaction => {
      const ref = admin.firestore().doc(`/users/${params.userId}`);
      const userDoc = await transaction.get(ref);
      const currentCount = (userDoc.data() as any).lystItemsCount[lystId];
      if (currentCount < 2) {
        return transaction.update(ref, { [`lystItemsCount.${lystId}`]: admin.firestore.FieldValue.delete() });
      } else {
        return transaction.update(ref, { [`lystItemsCount.${lystId}`]: admin.firestore.FieldValue.increment(-1) });
      }
    });
  });
