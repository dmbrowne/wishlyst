import { Box, BoxTypes } from "grommet";
import styled from "styled-components";
import { FC } from "react";

export const SImageContainer = styled(Box as FC<BoxTypes & { isMobile?: boolean }>).attrs(({ isMobile }) => ({
  border: true,
  width: "350px",
  height: isMobile ? "150px" : "350px",
}))`
  border-radius: 12px;
  position: relative;
  overflow: hidden;
`;

export const SShareContainer = styled(Box as FC<BoxTypes & { isMobile: boolean }>).attrs(({ theme: { dark }, isMobile }) => ({
  margin: { bottom: "small" },
  pad: isMobile ? "medium" : "none",
  background: isMobile ? (dark ? "dark-1" : "white") : undefined,
}))`
  border-radius: 8px;
`;
