import React, { useEffect, useState } from "react";
import { functions, auth } from "firebase/app";
import { ThemeProvider } from "styled-components";
import { Grommet } from "grommet";
import { BrowserRouter, Route } from "react-router-dom";
import Lists from "./pages/lists";
import Authentication from "./pages/authentication";
import ListDetail from "./pages/list-detail";
import { AuthProvider } from "./context/auth";
import customTheme from "./theme";

const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
  const getOpenGraphDetails = functions().httpsCallable("getImagesFromUrl");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    return auth().onAuthStateChanged(user => {
      if (user) {
        if (!loggedIn) setLoggedIn(true);
      } else {
        if (loggedIn) setLoggedIn(false);
      }
    });
  });

  const onClick = async () => {
    const graphData = await getOpenGraphDetails({
      url: "https://www.johnlewis.com/john-lewis-partners-lulu-wall-light/antique-brass/p151177"
    });
  };
  const signIn = () => {
    auth().signInWithRedirect(new auth.GoogleAuthProvider());
  };
  return (
    <ThemeProvider theme={customTheme}>
      <Grommet theme={customTheme} background={darkMode ? "black" : "light-1"} themeMode={darkMode ? "dark" : "light"} full>
        <BrowserRouter>
          <AuthProvider>
            <Route path="/" exact component={Lists} />
            <Route path="/login" component={Authentication} />
            <Route path="/lysts/:id" component={ListDetail} />
          </AuthProvider>
        </BrowserRouter>
      </Grommet>
    </ThemeProvider>
  );
}

export default App;
