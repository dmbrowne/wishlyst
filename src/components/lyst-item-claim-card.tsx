import React, { FC, useContext } from "react";
import { SRoundedCard } from "../styled-components/rounded-card";
import { Box, Heading, Text, Button, BoxTypes, Anchor } from "grommet";
import { ILystItem } from "../store/types";
import FirebaseImage from "./firebase-image";
import SObjectFitImage from "../styled-components/object-fit-image";
import getImgThumb, { EThumbSize } from "../utils/get-image-thumb";
import { Checkmark } from "grommet-icons";
import styled, { css, useTheme } from "styled-components";
import { AuthContext } from "../context/auth";
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
  const href = lystItem.url;
  const multiItem = lystItem.quantity > 1;
  const claimants = lystItem.claimants || [];
  const claimantsCount = claimants.length;
  const claimed = claimantsCount > 0;
  const fullyClaimed = claimantsCount === lystItem.quantity;
  const amountClaimedByUser = !account
    ? 0
    : claimants
    ? claimants.reduce((accum, userId) => (userId === account.uid ? accum + 1 : accum), 0)
    : 0;
  return (
    <LystItemCard lystItem={lystItem} muted={fullyClaimed} elevation={claimed ? "none" : undefined} onView={onView}>
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
          {multiItem && claimantsCount > 0 && (
            <>
              {account && claimants.includes(account.uid) ? (
                <Text color="dark-6" size="small">
                  You've already claimed {amountClaimedByUser}, claim more or allow someone else to claim it too
                </Text>
              ) : (
                <Text color="dark-6" size="small">
                  {lystItem.quantity - claimants.length} more available to claim
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
