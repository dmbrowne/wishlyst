import React, { FC } from "react";
import { ThemeProvider } from "styled-components";
import { Grommet, Box } from "grommet";
import { BrowserRouter, Route, Switch, RouteComponentProps } from "react-router-dom";
import { Provider as StoreProvider } from "react-redux";
import "gestalt/dist/gestalt.css";

import darkTheme from "./themes/black-theme";
import hpTheme from "./themes/hp-theme";

import store from "./store";

import { AuthProvider } from "./context/auth";
import ThemeModeProvider, { ThemeModeContext } from "./context/theme-mode";
import GuestProfileProvider from "./context/guest-profile";

import AuthenticatedRoute from "./components/authenticated-route";
import UserSanityGuard from "./components/user-sanity-guard";
import StandardLayout from "./layouts/standard";

import Lists from "./pages/lists";
import Login from "./pages/login";
import ListDetail from "./pages/list-detail";
import ClaimedItems from "./pages/claimed-items";
import Upgrade from "./pages/upgrade";
import Landing from "./pages/landing/landing-copy";
import Register from "./pages/register";
import CompleteAccount from "./pages/complete-account";
import Settings from "./pages/settings/settings";
import Admin from "./pages/admin";

const UsageRoutes: FC<RouteComponentProps> = ({ match }) => (
  <UserSanityGuard>
    <StandardLayout>
      <Switch>
        <Route noAnonymous exact path={match.url + "/wishlysts"} component={Lists} />
        <Route path={match.url + "/wishlysts/:id"} component={ListDetail} />
        <AuthenticatedRoute path={match.url + "/claimed"} component={ClaimedItems} />
        <AuthenticatedRoute path={match.url + "/settings"} component={Settings} />
        <AuthenticatedRoute path={match.url + "/admin"} component={Admin} />
      </Switch>
    </StandardLayout>
  </UserSanityGuard>
);
const AppRoutes = () => (
  <ThemeModeContext.Consumer>
    {({ useDarkMode }) => (
      <Grommet theme={useDarkMode ? darkTheme : hpTheme} themeMode={useDarkMode ? "dark" : "light"}>
        <Box height={{ min: "100vh" }}>
          <Switch>
            <Route path="/register" component={Register} />
            <Route path="/login" component={Login} />
            <AuthenticatedRoute path="/complete-account" component={CompleteAccount} />
            <AuthenticatedRoute path="/upgrade-account" component={Upgrade} />
            <Route path="/app" component={UsageRoutes} />
          </Switch>
        </Box>
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
