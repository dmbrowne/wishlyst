import { Box, BoxTypes } from "grommet";
import styled, { css } from "styled-components";
import { FC } from "react";

export const SAuthContainer = styled(Box as FC<BoxTypes>).attrs(props => ({
  width: { max: "750px" },
  border: true,
  pad: props.pad || "large",
  background: props.theme.dark ? "#111" : "white",
  alignSelf: "center",
}))`
  width: 100%;
  border-radius: 16px;

  @media (max-width: 767px) {
    padding: 16px;
    border: none;
    ${props =>
      props.theme.dark &&
      css`
        background: transparent;
      `}
  }
`;
