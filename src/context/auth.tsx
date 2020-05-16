import React, { useState, FC, useEffect, useRef } from "react";
import { auth, firestore, functions } from "firebase/app";
import { IUser, IClaimedItem } from "../store/types";
import { SocialProvider } from "../components/social-login";
import { IGuestProfile } from "./guest-profile";
import { useDispatch } from "react-redux";
import { fetchAccountSuccess, fetchUserProfileSuccess } from "../store/account";
import { useStateSelector } from "../store";

type TUnsubscribe = () => void;

interface IAuthContext {
  forceUpdate: () => void;
  convertAnonymousToEmailPassword: (values: { email: string; password: string }, guestProfile?: IGuestProfile) => Promise<any>;
  convertAnonymousWithSocialProvider: (provider: SocialProvider, guestProfile?: IGuestProfile) => Promise<any>;
}

export const AuthContext = React.createContext<IAuthContext>({
  forceUpdate: () => {},
  convertAnonymousToEmailPassword: () => Promise.resolve(),
  convertAnonymousWithSocialProvider: () => Promise.resolve(),
});

const UserWatcher: FC<{ userId: string }> = ({ userId, children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    return firestore()
      .doc(`users/${userId}`)
      .onSnapshot((userSnap: firestore.DocumentSnapshot<firestore.DocumentData>) => {
        dispatch(fetchUserProfileSuccess({ id: userSnap.id, ...(userSnap.data() as Omit<IUser, "id">) }));
      });
  }, [userId]);

  return <>{children}</>;
};

export const AuthProvider: FC = ({ children }) => {
  const dispatch = useDispatch();
  const { current: ugradeAnnoymousUser } = useRef(functions().httpsCallable("ugradeAnnoymousUser"));
  const { account, user, initialFetched } = useStateSelector(({ auth }) => auth);
  const [forcedUpdates, setForcedUpdates] = useState(0);

  useEffect(() => {
    return auth().onAuthStateChanged(accnt => {
      dispatch(fetchAccountSuccess(accnt));
    });
  }, []);

  const createUserAndSetAccount = (guestProfile: IGuestProfile) => ({ user: accnt }: auth.UserCredential) => {
    dispatch(fetchAccountSuccess(accnt));
    return ugradeAnnoymousUser(guestProfile);
  };

  const convertAnonymousToEmailPassword = (
    { email, password }: { email: string; password: string },
    guestProfile: IGuestProfile = {} as IGuestProfile
  ) => {
    if (!account || !account.isAnonymous) return Promise.reject();

    const credential = auth.EmailAuthProvider.credential(email, password);
    return account.linkWithCredential(credential).then(credential => createUserAndSetAccount(guestProfile)(credential));
  };

  const convertAnonymousWithSocialProvider = (provider: SocialProvider, guestProfile: IGuestProfile = {} as IGuestProfile) => {
    if (!account || !account.isAnonymous) return Promise.reject();
    return account.linkWithPopup(provider).then(createUserAndSetAccount(guestProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        forceUpdate: () => setForcedUpdates(forcedUpdates + 1),
        convertAnonymousToEmailPassword,
        convertAnonymousWithSocialProvider,
      }}
    >
      {account && !account.isAnonymous ? <UserWatcher userId={account.uid} children={children} /> : children}
    </AuthContext.Provider>
  );
};
