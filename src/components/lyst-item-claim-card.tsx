import React, { FC } from "react";
import { Box, Text, Button, Anchor } from "grommet";
import { ILystItem } from "../@types";
import { Checkmark } from "grommet-icons";
import { useTheme } from "styled-components";
import LystItemCard from "./lyst-item-card";
import { useStateSelector } from "../store";

interface IProps {
  lystItem: ILystItem;
  onClaim: () => void;
  onRemoveClaim?: () => void;
  onView?: () => any;
}

const LystItemClaimCard: FC<IProps> = ({ lystItem, onClaim, onView, onRemoveClaim }) => {
  const { dark } = useTheme();
  const account = useStateSelector(({ auth }) => auth.account);
  const { url: href, quantity, buyerIds = [], totalClaimed } = lystItem;
  const multiItem = quantity > 1;
  const hasAnExistingClaim = account?.uid ? buyerIds.includes(account.uid) : false;
  const claimedCount = totalClaimed || 0;
  const isPartiallyclaimed = claimedCount > 0;
  const fullyClaimed = claimedCount === quantity;

  return (
    <LystItemCard lystItem={lystItem} muted={fullyClaimed} elevation={isPartiallyclaimed ? "none" : undefined} onView={onView}>
      {href && (
        <Anchor color={dark ? "white" : "black"} alignSelf="end" href={href} target="_blank" margin={{ bottom: "xsmall" }}>
          <Text size="small">View Item</Text>
        </Anchor>
      )}
      {fullyClaimed && !hasAnExistingClaim && (
        <Text size="small" color="dark-6">
          This item has been claimed by someone else
        </Text>
      )}
      {!fullyClaimed && (
        <Box direction="row" gap="small" align="center">
          <Button label="Claim" alignSelf="start" primary onClick={onClaim} />
          {multiItem && isPartiallyclaimed && (
            <>
              {hasAnExistingClaim ? (
                <Text color="dark-6" size="small">
                  You've already put forward a claim, you can claim more or allow someone else to claim it too
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
      {fullyClaimed && hasAnExistingClaim && (
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
