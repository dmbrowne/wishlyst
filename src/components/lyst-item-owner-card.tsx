import React, { FC, useContext } from "react";
import LystItemCard from "./lyst-item-card";
import { ILystItem } from "../store/types";
import { Box, Text, ResponsiveContext, Button } from "grommet";
import { StatusGood } from "grommet-icons";
import ClaimInfo from "./claim-info";

interface IProps {
  lystItem: ILystItem;
  onView: () => void;
  onClaim: () => void;
  onViewpeople: () => void;
}

const ClaimedList: FC<{ claimants: string[]; showAmounts: boolean; allClaimed: boolean }> = ({ claimants, showAmounts, allClaimed }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  return (
    <Box direction="row" align="start" gap={isMobile ? "xxsmall" : "small"}>
      <StatusGood color={allClaimed ? "status-ok" : undefined} />
      <Text as="div" size="small">
        {isMobile ? "" : "people: "}
        <ClaimInfo claimants={claimants} showAmounts={showAmounts} textProps={{ size: "small", weight: "bold" }} />
      </Text>
    </Box>
  );
};

const LystItemOwnerCard: FC<IProps> = ({ lystItem, onView, onClaim, onViewpeople }) => {
  const { claimants } = lystItem;
  return (
    <LystItemCard key={lystItem.id} lystItem={lystItem} onView={onView}>
      <Box direction="row">
        {!!claimants?.length ? (
          <Box onClick={onViewpeople}>
            <ClaimedList claimants={claimants} showAmounts={false} allClaimed={claimants.length === lystItem.quantity} />
          </Box>
        ) : (
          <Button label="Mark as claimed" size="small" color="status-info" onClick={onClaim} />
        )}
      </Box>
    </LystItemCard>
  );
};

export default LystItemOwnerCard;
