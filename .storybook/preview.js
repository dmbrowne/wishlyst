import React, { useState } from "react";
import { addDecorator } from "@storybook/react";
import { withKnobs } from "@storybook/addon-knobs";
import { Grommet, Box } from "grommet";
import styled, { ThemeProvider } from "styled-components";
import hpTheme from "../src/themes/hp-theme";
import "../src/firebase";

addDecorator(withKnobs);
addDecorator(storyFn => {
  return (
    <ThemeProvider theme={hpTheme}>
      <Grommet full theme={hpTheme}>
        {storyFn()}
      </Grommet>
    </ThemeProvider>
  );
});
