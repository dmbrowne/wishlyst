import React, { FC, useContext } from "react";
import LystItemCard from "./lyst-item-card";
import { ILystItem } from "../@types";
import { Box, Text, ResponsiveContext, Button } from "grommet";
import { StatusGood } from "grommet-icons";
import ClaimInfo from "./claim-info";

interface IProps {
  lystItem: ILystItem;
  onView: () => void;
  onClaim: () => void;
  onViewBuyers: () => void;
}

const LystItemOwnerCard: FC<IProps> = ({ lystItem, onView, onClaim, onViewBuyers }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const { totalClaimed, buyerDisplayNames } = lystItem;
  const fullyClaimed = totalClaimed === lystItem.quantity;

  return (
    <LystItemCard key={lystItem.id} lystItem={lystItem} onView={onView}>
      <Box direction="row">
        {totalClaimed && totalClaimed > 0 ? (
          <Box onClick={onViewBuyers}>
            <Box direction="row" align="start" gap={isMobile ? "xxsmall" : "small"}>
              <StatusGood color={fullyClaimed ? "status-ok" : undefined} />
              <Text as="div" size="small">
                {isMobile ? "" : "buyers: "}
                {buyerDisplayNames && <ClaimInfo buyerNames={buyerDisplayNames} textProps={{ size: "small", weight: "bold" }} />}
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
