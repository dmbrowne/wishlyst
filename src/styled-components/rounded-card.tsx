import { Box, BoxTypes } from "grommet";
import styled from "styled-components";
import { FC } from "react";

export const SRoundedCard = styled(Box as FC<BoxTypes>).attrs(({ theme, pad, elevation }) => ({
  pad: pad || "medium",
  elevation: elevation || theme.dark ? "none" : "medium",
  background: theme.dark ? "dark-1" : "white"
}))`
  border-radius: 8px;
`;

export default SRoundedCard;
