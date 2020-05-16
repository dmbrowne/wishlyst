import { Box, BoxTypes } from "grommet";
import styled from "styled-components";
import { FC } from "react";

export const SRoundedCard = styled(Box as FC<BoxTypes>).attrs(({ theme, pad, elevation, background }) => ({
  pad: pad ? pad : "medium",
  elevation: elevation ? elevation : theme.dark ? "none" : "medium",
  background: background ? background : theme.dark ? "dark-1" : "white",
}))`
  border-radius: 8px;
`;

export default SRoundedCard;
