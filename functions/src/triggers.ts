import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const deleteAllLystItems = functions.firestore.document("lysts/{lystId}").onDelete(async (snap, { params }) => {
  const lystItemsSnap = await admin
    .firestore()
    .collection(`lysts/${params.lystId}/lystItems`)
    .get();
  const deletions = lystItemsSnap.docs.map(doc => doc.ref.delete());
  await Promise.all(deletions);
  return true;
});

export const deleteAllAnonymousUsers = functions.firestore.document("lysts/{lystId}").onDelete(async (snap, { params }) => {
  const usersSnap = await admin
    .firestore()
    .collection(`lysts/${params.lystId}/anonymousUsers`)
    .get();
  const deletions = usersSnap.docs.map(doc => doc.ref.delete());
  await Promise.all(deletions);
  return true;
});

export const removeCategoriesFromLystItem = functions.firestore
  .document("lysts/{lystId}/categories/{categoryId}")
  .onDelete(async (snap, { params }) => {
    const db = admin.firestore();
    const affectedItems = await admin
      .firestore()
      .collection(`lysts/${params.lystId}/lystItems`)
      .where("categoryId", "==", snap.id)
      .get();

    return db.runTransaction(transaction => {
      return Promise.all(affectedItems.docs.map(doc => transaction.get(doc.ref))).then(docs => {
        docs.forEach(doc => {
          if (doc.exists && (doc.data() as any).categoryId === snap.id) transaction.update(doc.ref, { categoryId: null });
        });
      });
    });
  });
