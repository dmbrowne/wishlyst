import React, { useState, FC } from "react";
import { auth, firestore } from "firebase";

interface IUser {
  id: string;
  email: string;
  displayName?: string;
}

export const AuthContext = React.createContext<{
  account: firebase.User | null;
  user: IUser | null;
}>({
  account: null,
  user: null,
});

export const AuthProvider: FC = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [account, setAccount] = useState<firebase.User | null>(null);

  auth().onAuthStateChanged(async (account) => {
    setAccount(account);
    if (account) {
      const fsUser = await firestore().doc(`users/${account.uid}`).get();
      setUser({ id: fsUser.id, ...(fsUser.data() as IUser) });
    } else {
      setUser(null);
    }
  });

  return <AuthContext.Provider value={{ user, account }}>{children}</AuthContext.Provider>;
};
