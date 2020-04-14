import React, { FC, useContext } from "react";
import { SRoundedCard } from "../styled-components/rounded-card";
import { Box, Heading, Text, Button, BoxTypes } from "grommet";
import { ILystItem } from "../store/types";
import FirebaseImage from "./firebase-image";
import SObjectFitImage from "../styled-components/object-fit-image";
import getImgThumb, { EThumbSize } from "../utils/get-image-thumb";
import { Checkmark } from "grommet-icons";
import styled, { css } from "styled-components";
import { AuthContext } from "../context/auth";

interface IProps {
  lystItem: ILystItem;
  claimed?: boolean;
  onClaim: () => void;
  onRemoveClaim?: (quantity: number) => void;
}

const RoundedHoverCard = styled(SRoundedCard as FC<BoxTypes & { muted?: boolean }>)`
  opacity: ${({ muted, theme: { dark } }) => (muted ? (dark ? "0.3" : "0.5") : "1")};

  ${props =>
    props.muted &&
    css`
      &:hover {
        opacity: 1;
      }

      transition: opacity 300ms;
    `}
`;

const LystItemClaimCard: FC<IProps> = ({ lystItem, claimed, onClaim, onRemoveClaim }) => {
  const { account } = useContext(AuthContext);
  const amountClaimedByUser = !account
    ? 0
    : lystItem.claimants
    ? lystItem.claimants.reduce((accum, userId) => (userId === account.uid ? accum + 1 : accum), 0)
    : 0;
  return (
    <RoundedHoverCard muted={claimed} justify="between" elevation={claimed ? "none" : undefined}>
      <Box>
        <Box height={{ max: "300px" }} style={{ height: "30vh" }}>
          {lystItem.thumb && (
            <FirebaseImage imageRef={getImgThumb(lystItem.thumb, EThumbSize.large)}>
              {imgUrl => <SObjectFitImage src={imgUrl} />}
            </FirebaseImage>
          )}
        </Box>
        <Heading level={4} children={lystItem.name} margin={{ bottom: "xsmall" }} />
        <Text size="small" color="neutral-1" margin={{ bottom: "medium" }}>
          Quantity: {lystItem.quantity}
        </Text>
      </Box>
      <Box>
        {!claimed && (
          <Box direction="row" gap="small" align="center">
            <Button label="Claim" alignSelf="start" primary onClick={onClaim} />
            {lystItem.quantity > 1 && lystItem.claimants && lystItem.claimants.length > 0 && (
              <>
                {account && lystItem.claimants.includes(account.uid) ? (
                  <Text color="dark-4" size="small">
                    You've already claimed {amountClaimedByUser}, claim more or allow someone else to claim it too
                  </Text>
                ) : (
                  <Text color="dark-4" size="small">
                    {amountClaimedByUser} already claimed by others, {lystItem.quantity - lystItem.claimants.length} more available to claim
                  </Text>
                )}
              </>
            )}
          </Box>
        )}
        {claimed && !onRemoveClaim && <Text color="dark-6">This item has been claimed by someone else</Text>}
        {!!onRemoveClaim && (
          <>
            {claimed && (
              <Box direction="row" gap="small" align="center">
                <Box height="48px" width="48px" flex={{ shrink: 0 }} pad="small" background="status-ok" style={{ borderRadius: "50%" }}>
                  <Checkmark />
                </Box>
                <Text color="dark-4" size="small" children="You have claimed this item" />
              </Box>
            )}
            <Button
              label="Remove claim"
              color="status-critical"
              margin={{ top: "small" }}
              onClick={() => onRemoveClaim(amountClaimedByUser)}
            />
          </>
        )}
      </Box>
    </RoundedHoverCard>
  );
};

export default LystItemClaimCard;
