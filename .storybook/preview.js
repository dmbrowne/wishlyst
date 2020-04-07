import React, { useState } from "react";
import { addDecorator } from "@storybook/react";
import { withKnobs } from "@storybook/addon-knobs";
import { Grommet, Box } from "grommet";
import styled, { ThemeProvider } from "styled-components";
import customTheme from "../src/theme";
import "../src/firebase";

addDecorator(withKnobs);
addDecorator(storyFn => {
  return (
    <ThemeProvider theme={customTheme}>
      <Grommet theme={customTheme}>{storyFn()}</Grommet>
    </ThemeProvider>
  );
});
