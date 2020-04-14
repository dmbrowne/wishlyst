import { useContext } from "react";
import { GuestProfileContext } from "../context/guest-profile";
import { IClaimedItem } from "../store/types";

const useGuestClaimedItems = () => {
  const { guestProfile } = useContext(GuestProfileContext);

  const getLystItemsByLyst = (lystId: string, getSortKey: (c: IClaimedItem) => string | number = c => c.claimedAt.toMillis()) => {
    if (!guestProfile?.claimedItems) return;
    return Object.values(guestProfile.claimedItems)
      .filter(claimedItem => claimedItem.lystId === lystId)
      .sort((a, b) => {
        if (getSortKey(a) < getSortKey(b)) return 1;
        else if (getSortKey(a) > getSortKey(b)) return -1;
        else return 0;
      });
  };

  return {
    getLystItemsByLyst,
  };
};

export default useGuestClaimedItems;
