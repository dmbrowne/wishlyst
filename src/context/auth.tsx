import React, { useState, FC, useEffect } from "react";
import { auth, firestore } from "firebase/app";
import { IUser, IClaimedItem } from "../store/types";

type TUnsubscribe = () => void;

export const AuthContext = React.createContext<{
  account: firebase.User | null;
  user: IUser | null;
  listenToClaimedItems: (lystId: string) => TUnsubscribe;
}>({
  account: null,
  user: null,
  listenToClaimedItems: () => () => {},
});

export const AuthProvider: FC = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [account, setAccount] = useState<firebase.User | null>(null);
  const [userUnsubscribe, setUserUnsubscribe] = useState(() => () => {});

  useEffect(() => {
    return auth().onAuthStateChanged(accnt => {
      setAccount(accnt);
    });
  }, []);

  useEffect(() => {
    if (account) {
      if (!account.isAnonymous) {
        return firestore()
          .doc(`users/${account.uid}`)
          .onSnapshot(userSnap => {
            setUser({ id: userSnap.id, ...(userSnap.data() as Omit<IUser, "id" | "claimedItems">) });
          });
      }
    } else {
      setUser(null);
    }
  }, [account]);

  const listenToClaimedItems = (lystId: string) => {
    if (!user) return () => {};

    return firestore()
      .doc(`users/${user.id}`)
      .collection(`claimedItems`)
      .where("lystId", "==", lystId)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(({ type, doc }) => {
          switch (type) {
            case "added":
              return {
                ...user,
                claimedItems: {
                  ...(user.claimedItems || {}),
                  [doc.id]: doc.data(),
                },
              };
            case "modified":
              return {
                ...user,
                claimedItems: {
                  ...(user.claimedItems || {}),
                  [doc.id]: {
                    ...(user.claimedItems?.[doc.id] || {}),
                    ...doc.data(),
                  },
                },
              };
            case "removed": {
              const claimedItems = user.claimedItems;
              if (!claimedItems) return user;
              return {
                ...user,
                claimedItems: Object.keys(claimedItems).reduce((accum, lystItemId) => {
                  const claimedItem = claimedItems[lystItemId];
                  return lystItemId === doc.id ? accum : { ...accum, [lystItemId]: claimedItem };
                }, {} as { [id: string]: IClaimedItem }),
              };
            }
            default:
              break;
          }
        });
      });
  };

  return <AuthContext.Provider value={{ user, account, listenToClaimedItems }}>{children}</AuthContext.Provider>;
};
