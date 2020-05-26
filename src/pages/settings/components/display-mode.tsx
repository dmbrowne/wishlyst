import React, { useContext } from "react";
import { Heading, Box } from "grommet";
import SObjectFitImage from "../../../styled-components/object-fit-image";
import { ThemeModeContext, ThemeMode } from "../../../context/theme-mode";

export const DisplayMode = () => {
  const { selectedMode, changeThemeMode } = useContext(ThemeModeContext);
  const themeDisplay = (themeMode: ThemeMode) => {
    const imgSrc = themeMode === "dark" ? "/imgs/dark_theme.png" : themeMode === "auto" ? "/imgs/auto_theme.png" : "/imgs/light_theme.png";
    const isActive = selectedMode === themeMode;
    return (
      <Box onClick={() => changeThemeMode(themeMode)}>
        <Box
          border={isActive ? { size: "5px", color: "brand" } : true}
          style={{ borderRadius: 8, overflow: "hidden", position: "relative" }}
        >
          <SObjectFitImage src={imgSrc} />
          {isActive && <Box background="brand" style={{ opacity: 0.5, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />}
        </Box>
        <Heading level={6} as="span" children={themeMode} textAlign="center" margin={{ top: "small" }} />
      </Box>
    );
  };
  return (
    <Box>
      <Heading level={4} children="Theme" margin={{ top: "none" }} />
      <Box direction="row" gap="medium">
        {themeDisplay("light")}
        {themeDisplay("dark")}
        {themeDisplay("auto")}
      </Box>
    </Box>
  );
};
