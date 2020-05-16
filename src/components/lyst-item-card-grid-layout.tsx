import React, { FC, useContext } from "react";
import { Text, Box, Button, ResponsiveContext } from "grommet";
import { StatusGood, Filter } from "grommet-icons";
import ClaimInfo from "./claim-info";
import GridListing from "../styled-components/grid-listing";
import LystItemCard from "./lyst-item-card";
import { ILystItem } from "../store/types";
import { useStateSelector } from "../store";
import LystItemOwnerCard from "./lyst-item-owner-card";
import LystItemClaimCard from "./lyst-item-claim-card";

interface IProps {
  lystItems: ILystItem[];
  onAddItem?: () => void;
  onClaim: (lystItemId: string) => any;
  onView: (lystItemId: string) => any;
  onFilter?: () => void;
  isOwner?: boolean;
  onRemoveClaim?: (lystItemId: string) => any;
}

const LystItemCardGridLayout: FC<IProps> = ({ onFilter, lystItems, onAddItem, onView, onClaim, isOwner, onRemoveClaim }) => {
  const claimFilter = useStateSelector(({ lysts }) => lysts.claimFilter);
  const showAddButton = isOwner && onAddItem && (claimFilter === "unclaimed" || !claimFilter);
  return (
    <Box>
      <Box height="40px" margin={{ bottom: "medium" }} justify="between" direction="row">
        <Box>{onFilter && <Button alignSelf="start" label="filter" icon={<Filter />} onClick={onFilter} />}</Box>
        <Box>{showAddButton && <Button label="Add another item" onClick={onAddItem} />}</Box>
      </Box>
      <GridListing>
        {lystItems.map(lystItem =>
          isOwner ? (
            <LystItemOwnerCard
              lystItem={lystItem}
              onClaim={() => onClaim(lystItem.id)}
              onViewpeople={() => onClaim(lystItem.id)}
              onView={() => onView(lystItem.id)}
            />
          ) : (
            <LystItemClaimCard
              key={lystItem.id}
              lystItem={lystItem}
              onClaim={() => onClaim(lystItem.id)}
              onView={() => onView(lystItem.id)}
              onRemoveClaim={onRemoveClaim ? () => onRemoveClaim(lystItem.id) : undefined}
            />
          )
        )}
      </GridListing>
      <Box height="40px" margin={{ vertical: "large" }}>
        {showAddButton && <Button label="Add another item" alignSelf="center" onClick={onAddItem} />}
      </Box>
    </Box>
  );
};

export default LystItemCardGridLayout;
