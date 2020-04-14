import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUserProfileOnAccountCreate = functions.auth.user().onCreate(account => {
  const db = admin.firestore();
  const batch = db.batch();
  const { uid, email: emailAddress, displayName, providerData } = account;

  const derivedData = providerData
    ? providerData.reduce((accum, provider) => {
        return {
          email: accum.email || provider.email,
          displayName: accum.displayName || provider.displayName
        };
      }, {} as { email: string; displayName: string })
    : ({} as { email: string; displayName: string });

  const email = emailAddress || derivedData.email;
  const name = displayName || derivedData.displayName || email.split("@")[0];

  batch.set(db.doc(`users/${uid}`), { email, name });
  batch.set(db.doc(`userEmails/${email}`), { userId: uid });

  return batch.commit();
});

export const updateAccountProfile = functions.firestore.document("users/{id}").onUpdate((change, { params }) => {
  const { before, after } = change as any;
  if (before.name === after.name) return;

  return admin.auth().updateUser(params.id, {
    displayName: after.name
  });
});

export const doesAccountExist = functions.https.onCall(async data => {
  const db = admin.firestore();
  const { email } = data;

  if (!email) throw new functions.https.HttpsError("invalid-argument", "email is a required");

  const { exists } = await db.doc(`userEmails/${email}`).get();

  return exists;
});
