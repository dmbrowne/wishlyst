import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUserProfileOnAccountCreate = functions.auth
  .user()
  .onCreate((account) => {
    const db = admin.firestore();
    const batch = db.batch();
    const { uid, email, displayName } = account;

    batch.set(db.doc(`users/${uid}`), { email, name: displayName });
    batch.set(db.doc(`userEmails/${email}`), { userId: uid });

    return batch.commit();
  });

export const doesAccountExist = functions.https.onCall(async (data) => {
  const db = admin.firestore();
  const { email } = data;

  if (!email)
    throw new functions.https.HttpsError(
      "invalid-argument",
      "email is a required"
    );

  const { exists } = await db.doc(`userEmails/${email}`).get();

  return exists;
});
