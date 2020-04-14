import React, { FC, useContext } from "react";
import { InfiniteScroll } from "grommet";
import LystItemClaimCard from "./lyst-item-claim-card";
import { ILystItem } from "../store/types";
import { AuthContext } from "../context/auth";

interface IProps {
  lystId: string;
  onClaim: (lystItem: ILystItem) => void;
  onRemoveClaim: (lystItemId: string, quantity: number) => void;
  loadMore: () => void;
  hasMore: boolean;
  items: ILystItem[];
}

const ClaimedLystItemsUserListing: FC<IProps> = ({ onClaim, onRemoveClaim, lystId, loadMore, hasMore, items }) => {
  const { account } = useContext(AuthContext);

  return (
    <InfiniteScroll onMore={hasMore ? loadMore : undefined} items={items}>
      {lystItem => {
        return (
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
    </InfiniteScroll>
  );
};

export default ClaimedLystItemsUserListing;
