import React, { FC, ReactElement, useContext } from "react";
import { SRoundedCard } from "../styled-components/rounded-card";
import { Box, Heading, Text, BoxTypes, ResponsiveContext, Button } from "grommet";
import { ILystItem } from "../@types";
import SObjectFitImage from "../styled-components/object-fit-image";
import styled, { css, useTheme } from "styled-components";
import { ReactComponent as PresentSphere } from "../assets/icons/present_sphere.svg";

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
  height: 25vh;
  max-height: 150px;
  @media (min-width: 640px) {
    max-height: 200px;
  }
  @media (min-width: 1200px) {
    max-height: 250px;
  }
  @media (min-width: 1440px) {
    max-height: 300px;
  }
`;

const LystItemCard: FC<IProps> = ({ lystItem, muted, footer, children, onView, ...props }) => {
  const child = footer || children;
  const { dark } = useTheme();
  const isMobile = useContext(ResponsiveContext) === "small";
  const claimedBgColor = dark ? "#3c5d51" : "status-ok-bg";
  const partialClaimedBgColor = dark ? "#403e33" : "status-warning-bg";
  const claimCount = lystItem.totalClaimed || 0;
  const isFullyClaimed = claimCount === lystItem.quantity;
  const isPartiallyClaimed = claimCount >= 1 && claimCount < lystItem.quantity;
  const cardBg = isFullyClaimed ? claimedBgColor : isPartiallyClaimed ? partialClaimedBgColor : undefined;

  return (
    <SRoundedHoverCard muted={muted} justify="between" animation="slideDown" background={cardBg} pad="small" {...props}>
      <Box>
        <Button plain onClick={onView}>
          <SImgContainer>
            {lystItem.image?.downloadUrl ? (
              <SObjectFitImage src={lystItem.image.downloadUrl} />
            ) : (
              <Box fill background={dark ? "dark-2" : "light-1"} align="center" justify="center">
                <Box width="90px" height="90px">
                  <PresentSphere color={dark ? "white" : "black"} />
                </Box>
              </Box>
            )}
          </SImgContainer>
        </Button>
        <Box onClick={onView} style={{ cursor: "pointer" }}>
          <SEllipsisHeading children={lystItem.name} />
        </Box>
        <Text size={isMobile ? "xsmall" : "small"} color="neutral-1" margin={{ bottom: "medium" }}>
          Quantity: {lystItem.quantity}
        </Text>
      </Box>
      {child && <Box>{child}</Box>}
    </SRoundedHoverCard>
  );
};

export default LystItemCard;
