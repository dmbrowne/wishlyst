import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const moveAllNestedLystItemsToRoot = functions.https.onCall(async () => {
  try {
    const snaps = await admin
      .firestore()
      .collection("lysts")
      .get();

    const wishlysts = snaps.docs.map(snap => ({
      id: snap.id,
      ...snap.data(),
      ref: snap.ref,
    }));

    const getWishlystItemsToCreate = wishlysts.map(async wishlyst => {
      const wishlystItems = await Promise.all([
        wishlyst.ref.collection("lystItems").get(),
        wishlyst.ref.collection("categories").get(),
      ]).then(([lystItemsSnap, categoriesSnap]) => {
        const categories = categoriesSnap.docs.reduce(
          (accum, snap) => ({
            ...accum,
            [snap.id]: snap.data(),
          }),
          {} as any
        );

        return lystItemsSnap.docs.map(snap => {
          const { categoryId, ...data } = snap.data();
          const category = data.categoryId ? categories[data.categoryId] : undefined;
          return {
            ...data,
            ...(category ? { category } : {}),
            id: snap.id,
            wishlystId: wishlyst.id,
            originalRef: snap.ref,
          };
        });
      });
      return { wishlyst, wishlystItems };
    });

    const wishlystItemsToCreateByWishlyst = await Promise.all(getWishlystItemsToCreate);

    const batch = admin.firestore().batch();

    wishlystItemsToCreateByWishlyst.forEach(({ wishlystItems }) => {
      wishlystItems.forEach(({ id, originalRef, ...wishlystItem }) => {
        const ref = admin
          .firestore()
          .collection("lystItems")
          .doc(id);
        batch.set(ref, wishlystItem);
        batch.delete(originalRef);
      });
    });

    await batch.commit();
    return true;
  } catch (e) {
    throw new functions.https.HttpsError("internal", e.message);
  }
});

export const fixCategoryData = functions.https.onCall(async () => {
  // prettier-ignore
  const lystsItemsSnap = await admin.firestore().collection("lystItems").where("categoryId", ">", "").get();

  const updatedLystItems: Array<[string, any]> = lystsItemsSnap.docs.map(lystsItemSnap => {
    const data = lystsItemSnap.data() as { categoryName?: { label: string } };
    const id = lystsItemSnap.id;
    const categoryName = data.categoryName && data.categoryName.label;
    const updatedData = categoryName ? { ...data, categoryName } : data;
    return [id, updatedData];
  });

  const batch = admin.firestore().batch();
  updatedLystItems.forEach(([id, item]) => {
    const ref = admin
      .firestore()
      .collection("lystItems")
      .doc(id);
    batch.set(ref, item);
  });
  await batch.commit();
  return true;
});
