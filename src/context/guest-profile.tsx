import React, { createContext, useState, useEffect, FC } from "react";
import { auth } from "firebase/app";
import { IUser } from "../store/types";
import { throttle } from "throttle-debounce";

export interface IGuestProfile extends Omit<IUser, "email" | "displayName" | "_private"> {}

type TGuestUpdater = (localUser: IGuestProfile) => IGuestProfile;

export const GuestProfileContext = createContext<{
  guestProfile: IGuestProfile | null;
  updateGuestProfile: (updater: TGuestUpdater) => void;
  getClaimedLystItemIdsByLystId: (lystId: string) => string[];
}>({
  guestProfile: null,
  updateGuestProfile: () => {},
  getClaimedLystItemIdsByLystId: () => [],
});

const GuestProfileProvider: FC = ({ children }) => {
  const localStorageUserKey = "wishlyst@unauthenticated_user";
  const [guestProfile, setGuestProfile] = useState<IGuestProfile | null>(null);

  useEffect(() => {
    return auth().onAuthStateChanged(account => {
      if (account) hydrateAndMergeLocalStorageUser(account);
    });
  }, []);

  useEffect(() => {
    const updateLocalStorage = throttle(2000, (localUserData: IGuestProfile) => {
      window.localStorage.setItem(localStorageUserKey, JSON.stringify(localUserData));
    });

    if (guestProfile) updateLocalStorage(guestProfile);

    return updateLocalStorage.cancel;
  }, [guestProfile]);

  const hydrateAndMergeLocalStorageUser = (account: firebase.User) => {
    const userFromStorage = window.localStorage.getItem(localStorageUserKey);

    if (!userFromStorage || userFromStorage === "null") {
      return setGuestProfile({ id: account.uid, lystItemsCount: {}, claimedItems: {} });
    }
    const hydratedUser = JSON.parse(userFromStorage) as IGuestProfile;
    setGuestProfile(hydratedUser);
  };

  const updateGuestProfile = (updater: TGuestUpdater) => {
    if (!guestProfile) return;
    setGuestProfile(updater(guestProfile));
  };

  const getClaimedLystItemIdsByLystId = (lystId: string) => {
    if (!guestProfile) return [];
    const { claimedItems } = guestProfile;
    if (!claimedItems) return [];

    return Object.keys(claimedItems).filter(lystItemId => {
      const lystItem = claimedItems[lystItemId];
      return lystItem.lystId === lystId;
    });
  };

  return (
    <GuestProfileContext.Provider value={{ guestProfile, updateGuestProfile, getClaimedLystItemIdsByLystId }}>
      {children}
    </GuestProfileContext.Provider>
  );
};

export default GuestProfileProvider;
