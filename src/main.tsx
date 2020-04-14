import React from "react";
import { ThemeProvider } from "styled-components";
import { Grommet } from "grommet";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { Provider as StoreProvider } from "react-redux";

import store from "./store";
import Lists from "./pages/lists";
import Authentication from "./pages/authentication";
import ListDetail from "./pages/list-detail";
import { AuthProvider } from "./context/auth";
import darkTheme from "./themes/black-theme";
import hpTheme from "./themes/hp-theme";
import ClaimedItems from "./pages/claimed-items";
import GuestProfileProvider from "./context/guest-profile";
import Account from "./pages/account";
import AuthenticatedRoute from "./components/authenticated-route";

const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  return (
    <ThemeProvider theme={hpTheme}>
      <Grommet
        theme={darkMode ? darkTheme : hpTheme}
        themeMode={darkMode ? "dark" : "light"}
        {...(!darkMode ? { background: "light-1" } : {})}
        full
      >
        <StoreProvider store={store}>
          <BrowserRouter>
            <AuthProvider>
              <GuestProfileProvider>
                <Switch>
                  <Route path="/" exact render={() => <Redirect to="/lysts" />} />
                  <AuthenticatedRoute noAnonymous path="/lysts" exact component={Lists} />
                  <Route path="/login" component={Authentication} />
                  <Route path="/lysts/:id" component={ListDetail} />
                  <AuthenticatedRoute path="/claimed" component={ClaimedItems} />
                  <AuthenticatedRoute path="/my-account" component={Account} />
                </Switch>
              </GuestProfileProvider>
            </AuthProvider>
          </BrowserRouter>
        </StoreProvider>
      </Grommet>
    </ThemeProvider>
  );
}

export default App;
