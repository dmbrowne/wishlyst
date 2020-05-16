import React, { useState, useEffect, createContext, FC } from "react";

export type ThemeMode = "light" | "dark" | "auto";

export const ThemeModeContext = createContext<{
  useDarkMode: boolean;
  changeThemeMode: (themeMode: ThemeMode) => void;
  selectedMode: ThemeMode;
}>({
  useDarkMode: false,
  changeThemeMode: () => {},
  selectedMode: "auto",
});

const ThemeModeProvider: FC = ({ children }) => {
  const localStorageKey = "wishlyst@etheme_mode";
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedThemeMode = window.localStorage.getItem(localStorageKey) as ThemeMode | null;
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(savedThemeMode || "auto");
  const [osDarkMode, setOSDarkMode] = useState(darkMode);

  useEffect(() => {
    window.matchMedia("(prefers-color-scheme: dark)").addListener(e => setOSDarkMode(e.matches));
  }, []);

  const changeThemeMode = (themeMode: ThemeMode) => {
    window.localStorage.setItem(localStorageKey, themeMode);
    setSelectedMode(themeMode);
  };

  const useDarkMode = selectedMode === "auto" ? osDarkMode : selectedMode === "dark" ? true : false;

  return <ThemeModeContext.Provider value={{ useDarkMode, changeThemeMode, selectedMode }}>{children}</ThemeModeContext.Provider>;
};

export default ThemeModeProvider;
