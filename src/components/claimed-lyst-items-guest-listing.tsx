import React, { useState, useRef, FC, useContext } from "react";
import GuestClaimedItems from "./guest-claimed-items";
import Spinner from "./spinner";
import LystItemClaimCard from "./lyst-item-claim-card";
import { firestore } from "firebase";
import { useStateSelector } from "../store";
import { useDispatch } from "react-redux";
import { fetchItemSuccess } from "../store/lyst-items";
import { ILystItem } from "../store/types";
import { AuthContext } from "../context/auth";

interface IProps {
  onStartListener: (unsubscribe: () => void) => void;
  lystId: string;
  onClaim: (lystItem: ILystItem) => void;
  onRemoveClaim: (lystItemId: string, quantity: number) => void;
}

const ClaimedLystItemsGuestListing: FC<IProps> = ({ onStartListener, lystId, onClaim, onRemoveClaim }) => {
  const dispatch = useDispatch();
  const { current: db } = useRef(firestore());
  const { account } = useContext(AuthContext);
  const [fetchingLystItems, setFetchingLystItems] = useState<{ [lystItemId: string]: boolean }>({});
  const allLystItems = useStateSelector(state => state.lystItems.allItems);

  const fetchLystItems = (storeRefs: string[]) => {
    storeRefs.forEach(storeRef => {
      const lystItemRef = db.doc(storeRef);

      if (allLystItems[lystItemRef.id]) return;

      setFetchingLystItems({ ...fetchingLystItems, [lystItemRef.id]: true });
      const unsubscribe = lystItemRef.onSnapshot(doc => {
        setFetchingLystItems({ ...fetchingLystItems, [lystItemRef.id]: false });
        dispatch(fetchItemSuccess({ id: doc.id, ...(doc.data() as ILystItem) }));
      });
      onStartListener(unsubscribe);
    });
  };

  return (
    <GuestClaimedItems loadLimit={10} lystId={lystId} inifiniteScroll onLoadSet={fetchLystItems}>
      {claimedItem => {
        const lystItemId = db.doc(claimedItem.lystItemRef).id;
        const lystItem = allLystItems[lystItemId];
        return !lystItem ? (
          fetchingLystItems[lystItemId] ? (
            <Spinner />
          ) : null
        ) : (
          <LystItemClaimCard
            key={lystItem.id}
            lystItem={lystItem}
            claimed={(lystItem.claimants && lystItem.claimants.length >= lystItem.quantity) || false}
            onClaim={() => onClaim(lystItem)}
            onRemoveClaim={
              account && lystItem.claimants?.includes(account.uid) ? quantity => onRemoveClaim(lystItem.id, quantity) : undefined
            }
          />
        );
      }}
    </GuestClaimedItems>
  );
};

export default ClaimedLystItemsGuestListing;
