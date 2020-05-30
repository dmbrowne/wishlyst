import { IBuyer, ILystItem } from "@types";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


export const increaseClaimCount = functions.firestore.document("lystItems/{itemId}/buyers/{buyerId}").onCreate(async (snap, context) => {
  const db = admin.firestore();
  const lystItemRef = db.doc(`lystItems/${context.params.itemId}`);
  return db.runTransaction(async transaction => {
    const lystItem = await transaction.get(lystItemRef);
    const totalClaimed = (lystItem.data() as ILystItem).totalClaimed || 0;
    const newClaimTotal = totalClaimed + (snap.data() as IBuyer).count;
    transaction.update(lystItemRef, { totalClaimed: newClaimTotal });
  });
});

export const updateClaimCount = functions.firestore
  .document("lystItems/{itemId}/buyers/{buyerId}")
  .onUpdate(async ({ before, after }, context) => {
    const db = admin.firestore();
    const lystItemRef = db.doc(`lystItems/${context.params.itemId}`);
    return db.runTransaction(async transaction => {
      const lystItem = await transaction.get(lystItemRef);
      const totalClaimed = (lystItem.data() as ILystItem).totalClaimed || 0;
      const previousBuyerCount = (before.data() as IBuyer).count;
      const newBuyerCount = (after.data() as IBuyer).count;
      const countDifference = newBuyerCount - previousBuyerCount;
      const newClaimTotal = totalClaimed + countDifference;
      transaction.update(lystItemRef, { totalClaimed: newClaimTotal });
    });
  });

export const removeBuyersClaimCount = functions.firestore
  .document("lystItems/{itemId}/buyers/{buyerId}")
  .onDelete(async (snap, context) => {
    const db = admin.firestore();
    const lystItemRef = db.doc(`lystItems/${context.params.itemId}`);
    return db.runTransaction(async transaction => {
      const lystItem = await transaction.get(lystItemRef);
      const totalClaimed = (lystItem.data() as ILystItem).totalClaimed || 0;
      const countBeforeDelete = (snap.data() as IBuyer).count;
      let newClaimTotal = totalClaimed - countBeforeDelete;
      newClaimTotal = newClaimTotal < 0 ? 0 : newClaimTotal;
      transaction.update(lystItemRef, { totalClaimed: newClaimTotal });
    });
  });

export const addQuickViewBuyerNameAndId = functions.firestore.document("lystItems/{itemId}/buyers/{buyerId}").onCreate((snap, context) => {
  const db = admin.firestore();
  const lystItemRef = db.doc(`lystItems/${context.params.itemId}`);
  const buyer = snap.data() as IBuyer;
  return lystItemRef.update({
    buyerIds: admin.firestore.FieldValue.arrayUnion(buyer.userId),
    buyerDisplayNames: admin.firestore.FieldValue.arrayUnion(buyer.displayName),
  });
});

export const updateQuickViewBuyerNameAndId = functions.firestore
  .document("lystItems/{itemId}/buyers/{buyerId}")
  .onUpdate(({ before, after }, context) => {
    const db = admin.firestore();
    const beforeData = before.data() as IBuyer;
    const afterData = after.data() as IBuyer;

    if (!afterData.confirmed) return;
    if (afterData.displayName === beforeData.displayName) return;

    const lystItemRef = db.doc(`lystItems/${context.params.itemId}`);
    const batch = db.batch();
    batch.update(lystItemRef, {
      buyerDisplayNames: admin.firestore.FieldValue.arrayRemove(beforeData.displayName),
    });
    batch.update(lystItemRef, {
      buyerDisplayNames: admin.firestore.FieldValue.arrayUnion(afterData.displayName),
    });
    return batch.commit();
  });

export const removeQuickViewBuyerNameAndId = functions.firestore
  .document("lystItems/{itemId}/buyers/{buyerId}")
  .onDelete((snap, context) => {
    const db = admin.firestore();
    const data = snap.data() as IBuyer;
    const lystItemRef = db.doc(`lystItems/${context.params.itemId}`);
    return lystItemRef.update({
      buyerIds: admin.firestore.FieldValue.arrayRemove(data.userId),
      buyerDisplayNames: admin.firestore.FieldValue.arrayRemove(data.displayName),
    });
  });
