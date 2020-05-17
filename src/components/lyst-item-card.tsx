import React, { FC, ReactElement, useContext } from "react";
import { SRoundedCard } from "../styled-components/rounded-card";
import { Box, Heading, Text, BoxTypes, ResponsiveContext } from "grommet";
import { ILystItem } from "../store/types";
import FirebaseImage from "./firebase-image";
import SObjectFitImage from "../styled-components/object-fit-image";
import getImgThumb, { EThumbSize } from "../utils/get-image-thumb";
import styled, { css, useTheme } from "styled-components";
import { getAmountClaimed } from "../store";

interface IProps extends BoxTypes {
  lystItem: ILystItem;
  muted?: boolean;
  footer?: ReactElement;
  onView?: BoxTypes["onClick"];
}

const SRoundedHoverCard = styled(SRoundedCard as FC<BoxTypes & { muted?: boolean }>)`
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

const SEllipsisHeading = styled(Heading).attrs(() => ({
  level: 5,
  margin: { bottom: "xsmall" },
}))`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: ${props => (!!props.onClick ? "pointer" : "default")};

  ${props =>
    !!props.onClick &&
    css`
      &:hover {
        text-decoration: underline;
      }
    `};

  @media (max-width: 767px) {
    font-size: 13px;
    white-space: normal;
  }
`;

const SImgContainer = styled(Box)`
  overflow: hidden;
  height: "25vh";
  max-height: 150px;
  @media (min-width: 640px) {
    max-height: 200px;
  }
  @media (min-width: 1024px) {
    max-height: 250px;
  }
  @media (min-width: 1366px) {
    max-height: 300px;
  }
`;

const LystItemCard: FC<IProps> = ({ lystItem, muted, footer, children, onView, ...props }) => {
  const child = footer || children;
  const { dark } = useTheme();
  const isMobile = useContext(ResponsiveContext) === "small";
  const claimedBgColor = dark ? "#3c5d51" : "status-ok-bg";
  const partialClaimedBgColor = dark ? "#403e33" : "status-warning-bg";
  const claimCount = getAmountClaimed(lystItem.buyers);
  const isFullyClaimed = claimCount === lystItem.quantity;
  const isPartiallyClaimed = claimCount >= 1 && claimCount < lystItem.quantity;
  const cardBg = isFullyClaimed ? claimedBgColor : isPartiallyClaimed ? partialClaimedBgColor : undefined;

  return (
    <SRoundedHoverCard muted={muted} justify="between" animation="slideDown" background={cardBg} pad="small" {...props}>
      <Box>
        <SImgContainer>
          {lystItem.thumb && (
            <FirebaseImage imageRef={getImgThumb(lystItem.thumb, EThumbSize.large)}>
              {imgUrl => <SObjectFitImage src={imgUrl} />}
            </FirebaseImage>
          )}
        </SImgContainer>
        <SEllipsisHeading onClick={onView} children={lystItem.name} />
        <Text size={isMobile ? "xsmall" : "small"} color="neutral-1" margin={{ bottom: "medium" }}>
          Quantity: {lystItem.quantity}
        </Text>
      </Box>
      {child && <Box>{child}</Box>}
    </SRoundedHoverCard>
  );
};

export default LystItemCard;
