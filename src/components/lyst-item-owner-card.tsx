import React, { FC, useContext } from "react";
import LystItemCard from "./lyst-item-card";
import { ILystItem } from "../store/types";
import { Box, Text, ResponsiveContext, Button } from "grommet";
import { StatusGood } from "grommet-icons";
import ClaimInfo from "./claim-info";
import { getAmountClaimed } from "../store";

interface IProps {
  lystItem: ILystItem;
  onView: () => void;
  onClaim: () => void;
  onViewBuyers: () => void;
}

const LystItemOwnerCard: FC<IProps> = ({ lystItem, onView, onClaim, onViewBuyers }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const claimedCount = getAmountClaimed(lystItem.buyers);
  const fullyClaimed = claimedCount === lystItem.quantity;

  return (
    <LystItemCard key={lystItem.id} lystItem={lystItem} onView={onView}>
      <Box direction="row">
        {claimedCount > 0 ? (
          <Box onClick={onViewBuyers}>
            <Box direction="row" align="start" gap={isMobile ? "xxsmall" : "small"}>
              <StatusGood color={fullyClaimed ? "status-ok" : undefined} />
              <Text as="div" size="small">
                {isMobile ? "" : "buyers: "}
                <ClaimInfo buyers={lystItem.buyers || {}} showAmounts={false} textProps={{ size: "small", weight: "bold" }} />
              </Text>
            </Box>
          </Box>
        ) : (
          <Button label="Mark as claimed" size="small" color="status-info" onClick={onClaim} />
        )}
      </Box>
    </LystItemCard>
  );
};

export default LystItemOwnerCard;
