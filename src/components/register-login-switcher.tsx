import React, { ReactNode, FC, useState } from "react";
import { Box, BoxTypes } from "grommet";
import styled, { css } from "styled-components";

interface IProps {
  renderEmail: ReactNode;
  renderPassword: ReactNode;
  mode: "email" | "password";
}

const STranslationBox = styled(Box as FC<BoxTypes & { switched?: boolean }>).attrs(() => ({ direction: "row" }))`
  width: 200%;
  max-width: none;
  transform: translate3d(0, 0, 0);
  transition: transform 300ms;

  ${({ switched }) =>
    switched &&
    css`
      transform: translate3d(-50%, 0, 0);
    `}
`;

const RegisterLoginSwitcher: FC<IProps> = ({ renderEmail, renderPassword, mode }) => (
  <Box overflow="hidden" width="100%">
    <STranslationBox switched={mode === "password"} align="end">
      <Box width="50%">{renderEmail}</Box>
      <Box width="50%">{renderPassword}</Box>
    </STranslationBox>
  </Box>
);

export default RegisterLoginSwitcher;
