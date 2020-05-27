import React, { FC } from "react";
import { Box, Button } from "grommet";
import { Filter, Add } from "grommet-icons";
import GridListing from "../styled-components/grid-listing";
import { ILystItem } from "../@types";
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
      <Box margin={{ bottom: "medium" }} justify="between" direction="row">
        <Box round="full" border overflow="hidden">
          {onFilter && <Button onClick={onFilter} icon={<Filter />} />}
        </Box>
        <Box round="full" border overflow="hidden">
          {showAddButton && <Button hoverIndicator icon={<Add />} onClick={onAddItem} />}
        </Box>
      </Box>
      <GridListing>
        {lystItems.map(lystItem => (
          <React.Fragment key={lystItem.id}>
            {isOwner ? (
              <LystItemOwnerCard
                lystItem={lystItem}
                onClaim={() => onClaim(lystItem.id)}
                onViewBuyers={() => onClaim(lystItem.id)}
                onView={() => onView(lystItem.id)}
              />
            ) : (
              <LystItemClaimCard
                lystItem={lystItem}
                onClaim={() => onClaim(lystItem.id)}
                onView={() => onView(lystItem.id)}
                onRemoveClaim={onRemoveClaim ? () => onRemoveClaim(lystItem.id) : undefined}
              />
            )}
          </React.Fragment>
        ))}
      </GridListing>
      <Box height="40px" margin={{ vertical: "large" }}>
        {showAddButton && <Button label="Add another item" alignSelf="center" onClick={onAddItem} />}
      </Box>
    </Box>
  );
};

export default LystItemCardGridLayout;
