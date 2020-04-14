import React from "react";
import { Box, Button, ButtonType, Text } from "grommet";
import styled from "styled-components";
import { FC, ReactElement } from "react";

const SFabBox = styled(Box).attrs(({ theme, elevation }) => ({
  elevation: elevation || theme.dark ? "none" : "medium",
  background: theme.dark ? "dark-3" : "white",
  pad: "small"
}))`
  display: inline-flex;
  border-radius: 50%;
`;

export const FabButton: FC<{ icon: ReactElement; label?: string } & ButtonType> = ({ icon, label, ...props }) => (
  <Button style={{ textAlign: "center" }} {...props}>
    <SFabBox>{icon}</SFabBox>
    {label && (
      <Text margin={{ top: "small" }} style={{ display: "flex" }}>
        {label}
      </Text>
    )}
  </Button>
);
