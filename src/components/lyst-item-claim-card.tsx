import React, { FC } from "react";
import { Box, Text, Button, Anchor } from "grommet";
import { ILystItem } from "../store/types";
import { Checkmark } from "grommet-icons";
import { useTheme } from "styled-components";
import LystItemCard from "./lyst-item-card";
import { useStateSelector, getAmountClaimed } from "../store";

interface IProps {
  lystItem: ILystItem;
  onClaim: () => void;
  onRemoveClaim?: () => void;
  onView?: () => any;
}

const LystItemClaimCard: FC<IProps> = ({ lystItem, onClaim, onView, onRemoveClaim }) => {
  const { dark } = useTheme();
  const account = useStateSelector(({ auth }) => auth.account);
  const href = lystItem.url;
  const multiItem = lystItem.quantity > 1;
  const userBought = account ? lystItem.buyers && lystItem.buyers[account.uid] : null;
  const amountClaimedByUser = userBought ? userBought.count : 0;
  const claimedCount = getAmountClaimed(lystItem.buyers);
  const isPartiallyclaimed = claimedCount > 0;
  const fullyClaimed = claimedCount === lystItem.quantity;

  return (
    <LystItemCard lystItem={lystItem} muted={fullyClaimed} elevation={isPartiallyclaimed ? "none" : undefined} onView={onView}>
      {href && (
        <Anchor color={dark ? "white" : "black"} alignSelf="end" href={href} target="_blank" margin={{ bottom: "xsmall" }}>
          <Text size="small">View Item</Text>
        </Anchor>
      )}
      {fullyClaimed && amountClaimedByUser === 0 && (
        <Text size="small" color="dark-6">
          This item has been claimed by someone else
        </Text>
      )}
      {!fullyClaimed && (
        <Box direction="row" gap="small" align="center">
          <Button label="Claim" alignSelf="start" primary onClick={onClaim} />
          {multiItem && isPartiallyclaimed && (
            <>
              {userBought ? (
                <Text color="dark-6" size="small">
                  You've already claimed {amountClaimedByUser}, claim more or allow someone else to claim it too
                </Text>
              ) : (
                <Text color="dark-6" size="small">
                  {lystItem.quantity - claimedCount} more available to claim
                </Text>
              )}
            </>
          )}
        </Box>
      )}
      {fullyClaimed && amountClaimedByUser > 0 && (
        <>
          <Box direction="row" gap="small" align="center">
            <Box round="full" flex={{ shrink: 0 }} pad="small" background="status-ok">
              <Checkmark size="small" />
            </Box>
            <Text color="dark-6" size="small" children="You have claimed this item" />
          </Box>
          {onRemoveClaim && (
            <Button label="Remove claim" color="status-critical" margin={{ top: "small" }} onClick={() => onRemoveClaim()} />
          )}
        </>
      )}
    </LystItemCard>
  );
};

export default LystItemClaimCard;
