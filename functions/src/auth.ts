import { IUser } from "@types";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

type AccountType = "standard" | "admin";

const generateUserDocument = (userData: Omit<IUser, "id" | "_private">, accountType: AccountType = "standard"): Omit<IUser, "id"> => {
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
  }, {} as Pick<IUser, "email" | "displayName"> & { photoURL: string | null });

  return derivedDataFromProvider;
};

const prepNewUser = (account: admin.auth.UserRecord, accountType: AccountType = "standard") => {
  const { email: emailAddress, displayName, providerData, photoURL } = account;
  const derivedDataFromProvider = providerData ? getDetailsFromProvider(providerData) : { email: null, displayName: null, photoURL: null };

  const email = emailAddress || derivedDataFromProvider.email || "";
  const name = displayName || derivedDataFromProvider.displayName || "null";
  const photo = photoURL || derivedDataFromProvider.photoURL || null;

  return generateUserDocument(
    {
      email,
      displayName: name,
      ...(photo ? { image: { downloadUrl: photo } } : {}),
    },
    accountType
  );
};

export const updateAccountDisplayName = functions.firestore.document("users/{id}").onUpdate((change, { params }) => {
  const { before, after } = change as any;
  if (before.name === after.name) return Promise.resolve("Skipping. display name has not changed");

  return admin.auth().updateUser(params.id, {
    displayName: after.name,
  });
});

export const ugradeAnnoymousUser = functions.https.onCall(async (data, context) => {
  const { uid } = context.auth || {};

  if (!uid) throw new functions.https.HttpsError("unauthenticated", "token not found in request");

  const account = await admin.auth().getUser(uid);

  if (!account) throw new functions.https.HttpsError("not-found", "user account not found");

  const newUser = prepNewUser(account);
  const db = admin.firestore();
  const batch = db.batch();

  batch.set(db.doc(`users/${uid}`), { ...data, email: newUser.email, displayName: newUser.displayName });
  if (newUser.email) {
    batch.set(db.doc(`userEmails/${account.email}`), { userId: uid });
  }
  await batch.commit();
});

type CreateUserProfileData = { uid: string; firstName: string; lastName: string; displayName: string };
export const createUserProfile = functions.runWith({ memory: "512MB" }).https.onCall(async (data: CreateUserProfileData, context) => {
  const { uid, firstName, lastName, displayName } = data;
  if (!uid) throw new functions.https.HttpsError("unauthenticated", "token not found in request");
  const account = await admin.auth().getUser(uid);
  if (!account) throw new functions.https.HttpsError("not-found", "user account not found");

  try {
    const newUser = await prepNewUser(account);
    if (firstName) newUser.firstName = firstName;
    if (lastName) newUser.lastName = lastName;
    if (!newUser.displayName) newUser.displayName = displayName;

    const db = admin.firestore();
    const { exists, ref } = await db.doc(`users/${account.uid}`).get();
    await (exists ? ref.update(newUser) : ref.set(newUser));
    return true;
  } catch (e) {
    throw new functions.https.HttpsError("internal", e.message);
  }
});
