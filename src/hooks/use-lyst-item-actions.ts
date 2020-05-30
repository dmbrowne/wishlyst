import { IBuyer, IUser } from "../@types";
import { auth } from "firebase/app";
import { db } from "../firebase";

const useLystItemActions = (lystId: string, lystItemId: string) => {
  const lystItemsRef = db.collection(`lystItems`);
  const lystItemRef = lystItemsRef.doc(lystItemId);

  const getUserClaimSnapshot = async (userId: string) => {
    const snapshot = await lystItemRef
      .collection("buyers")
      .where("userId", "==", userId)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    return snapshot.docs[0];
  };

  const createClaim = async (count: number, claimantId: string, displayName?: string) => {
    const claimantIsCurrentUser = auth().currentUser?.uid === claimantId;
    const user = await db.doc(`users/${claimantId}`).get();
    const isAnonymous = !user.exists;
    const userData = user.data() as IUser;
    const defaultDisplayName = userData ? userData.displayName : undefined;
    const displayNameToUse = displayName || defaultDisplayName;
    const isDefaultName = displayNameToUse === defaultDisplayName;

    if (!displayNameToUse) throw Error("Displayname is a required argument for claims");

    const buyerDetails: IBuyer = {
      confirmed: isAnonymous ? true : claimantIsCurrentUser,
      userId: claimantId,
      displayName: displayNameToUse,
      count,
      isAnonymous,
      useDefaultName: isDefaultName,
    };

    const create = await lystItemRef.collection("buyers").add(buyerDetails);
    return create;
  };

  const updateClaim = (buyerDocId: string, buyDetails: Partial<Omit<IBuyer, "userId" | "confirmed" | "isAnonymous">>) => {
    lystItemRef
      .collection("buyers")
      .doc(buyerDocId)
      .update(buyDetails);
  };

  const removeClaim = (buyerDocId: string) => {
    lystItemRef
      .collection("buyers")
      .doc(buyerDocId)
      .delete();
  };

  return {
    createClaim,
    updateClaim,
    removeClaim,
    getUserClaimSnapshot,
  };
};

export default useLystItemActions;
