import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { request } from "https";

type AccountType = "standard" | "admin";
interface FirestoreUserData {
  email: string | null;
  displayName: string | null;
  thumb?: string | null;
  firstName?: string;
  lastName?: string;
  _private: { role: AccountType };
}

const generateUserDocument = (userData: Omit<FirestoreUserData, "_private">, accountType: AccountType = "standard"): FirestoreUserData => {
  return {
    ...userData,
    _private: {
      role: accountType,
    },
  };
};

const getDetailsFromProvider = (providerData: admin.auth.UserInfo[]) => {
  const derivedDataFromProvider = providerData.reduceRight((accum, provider) => {
    return {
      email: accum.email || provider.email,
      displayName: accum.displayName || provider.displayName,
      photoURL: accum.photoURL || provider.photoURL,
    };
  }, {} as Pick<FirestoreUserData, "email" | "displayName"> & { photoURL: string | null });

  return derivedDataFromProvider;
};

const uploadPhotoToStorageFromUrl = async (url: string, userId: string) => {
  const storagePath = `users/avatar_${userId}`;
  const bucket = admin.storage().bucket();
  const remoteWriteStream = bucket.file(storagePath).createWriteStream({
    metadata: { contentType: "image/jpeg" },
  });

  try {
    await new Promise((resolve, reject) => {
      request(url)
        .pipe(remoteWriteStream)
        .on("error", e => reject("could not save image to bucket. Error: \n" + e.message))
        .on("finish", resolve);
    });
    return storagePath;
  } catch (error) {
    return null;
  }
};

const prepNewUser = async (account: admin.auth.UserRecord, accountType: AccountType = "standard") => {
  const { uid, email: emailAddress, displayName, providerData, photoURL } = account;
  const derivedDataFromProvider = providerData ? getDetailsFromProvider(providerData) : { email: null, displayName: null, photoURL: null };

  const email = emailAddress || derivedDataFromProvider.email || null;
  const name = displayName || derivedDataFromProvider.displayName || null;
  const photo = photoURL || derivedDataFromProvider.photoURL || null;
  const thumb = photo ? await uploadPhotoToStorageFromUrl(photo, uid) : null;

  return generateUserDocument({ email, displayName: name, thumb }, accountType);
};

export const updateAccountProfile = functions.firestore.document("users/{id}").onUpdate((change, { params }) => {
  const { before, after } = change as any;
  if (before.name === after.name) return;

  return admin.auth().updateUser(params.id, {
    displayName: after.name,
  });
});

export const doesAccountExist = functions.https.onCall(async data => {
  const db = admin.firestore();
  const { email } = data;

  if (!email) throw new functions.https.HttpsError("invalid-argument", "email is a required");

  const { exists } = await db.doc(`userEmails/${email}`).get();

  return exists;
});

export const ugradeAnnoymousUser = functions.https.onCall(async (data, context) => {
  const { uid } = context.auth || {};

  if (!uid) throw new functions.https.HttpsError("unauthenticated", "token not found in request");

  const account = await admin.auth().getUser(uid);

  if (!account) throw new functions.https.HttpsError("not-found", "user account not found");

  const newUser = await prepNewUser(account);
  const db = admin.firestore();
  const batch = db.batch();

  batch.set(db.doc(`users/${uid}`), { ...data, email: newUser.email, displayName: newUser.displayName });
  if (newUser.email) {
    batch.set(db.doc(`userEmails/${account.email}`), { userId: uid });
  }
  await batch.commit();
});

type CreateUserProfileData = { uid: string; firstName: string; lastName: string };
export const createUserProfile = functions.https.onCall(async (data: CreateUserProfileData, context) => {
  const { uid, firstName, lastName } = data;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "token not found in request");
  const account = await admin.auth().getUser(uid);
  if (!account) throw new functions.https.HttpsError("not-found", "user account not found");
  const newUser = await prepNewUser(account);

  if (firstName) newUser.firstName = firstName;
  if (lastName) newUser.lastName = lastName;
  if (!newUser.displayName) newUser.displayName = `${firstName} ${lastName.charAt(0)}`;

  const db = admin.firestore();
  const batch = db.batch();
  batch.set(db.doc(`users/${account.uid}`), newUser);
  if (newUser.email) {
    batch.set(db.doc(`userEmails/${newUser.email}`), { userId: account.uid });
  }
  await batch.commit();
  return true;
});
