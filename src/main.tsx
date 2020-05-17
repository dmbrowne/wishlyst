import React from "react";
import { ThemeProvider } from "styled-components";
import { Grommet, Box } from "grommet";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Provider as StoreProvider } from "react-redux";

import store from "./store";
import Lists from "./pages/lists";
import Login from "./pages/login";
import ListDetail from "./pages/list-detail";
import { AuthProvider } from "./context/auth";
import darkTheme from "./themes/black-theme";
import hpTheme from "./themes/hp-theme";
import ClaimedItems from "./pages/claimed-items";
import GuestProfileProvider from "./context/guest-profile";
import Account from "./pages/account";
import AuthenticatedRoute from "./components/authenticated-route";
import StandardLayout from "./layouts/standard";
import Upgrade from "./pages/upgrade";
import ThemeModeProvider, { ThemeModeContext } from "./context/theme-mode";
import Landing from "./pages/landing-copy";
import Register from "./pages/register";
import EnterName from "./pages/enter-name";
import UserSanityGuard from "./components/user-sanity-guard";

const UsageRoutes = () => (
  <StandardLayout>
    <Switch>
      <Route noAnonymous exact path="/lysts" component={Lists} />
      <Route path="/lysts/:id" component={ListDetail} />
      <AuthenticatedRoute path="/claimed" component={ClaimedItems} />
      <AuthenticatedRoute path="/my-account" component={Account} />
      <AuthenticatedRoute path="/upgrade-account" component={Upgrade} />
    </Switch>
  </StandardLayout>
);
const AppRoutes = () => (
  <ThemeModeContext.Consumer>
    {({ useDarkMode }) => (
      <Grommet theme={useDarkMode ? darkTheme : hpTheme} themeMode={useDarkMode ? "dark" : "light"}>
        <UserSanityGuard>
          <Box height={{ min: "100vh" }}>
            <Switch>
              <Route path="/register" component={Register} />
              <Route path="/login" component={Login} />
              <AuthenticatedRoute path="/complete-account" component={EnterName} />
              <Route component={UsageRoutes} />
            </Switch>
          </Box>
        </UserSanityGuard>
      </Grommet>
    )}
  </ThemeModeContext.Consumer>
);

const App = () => {
  return (
    <ThemeModeProvider>
      <ThemeProvider theme={hpTheme}>
        <StoreProvider store={store}>
          <BrowserRouter>
            <AuthProvider>
              <GuestProfileProvider>
                <Switch>
                  <Route path="/" exact component={Landing} />
                  <Route component={AppRoutes} />
                </Switch>
              </GuestProfileProvider>
            </AuthProvider>
          </BrowserRouter>
        </StoreProvider>
      </ThemeProvider>
    </ThemeModeProvider>
  );
};

export default App;
