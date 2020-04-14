import React, { useState, useRef, useEffect, FC, useContext } from "react";
import { Box, TextInput, FormField, Text, ThemeContext, Button } from "grommet";
import { Google, Twitter, Facebook } from "grommet-icons";
import styled from "styled-components";
import { RouteComponentProps } from "react-router-dom";
import firebase, { functions, auth } from "firebase/app";

import Spinner from "../components/spinner";
import asyncCatch from "../utils/async-catch";
import withHoverableIcon from "../components/hoverable-icon";
import { ReactComponent as Logo } from "../icons/wishlystlogo.svg";

const SAuthContainer = styled(Box).attrs(props => ({
  width: { max: "750px" },
  border: true,
  pad: "large"
}))`
  width: 100%;
  border-radius: 16px;
`;

const STextError = styled(Text).attrs(() => ({
  size: "small",
  margin: { top: "xsmall", bottom: "medium" },
  color: "status-error",
  textAlign: "center"
}))``;

const SLogoContainer = styled(Box).attrs(() => ({
  width: "250px",
  margin: { horizontal: "large", bottom: "large" },
  alignSelf: "center"
}))`
  color: ${props => props.theme.global?.colors?.brand || "#000"};
`;

const GoogleIcon = withHoverableIcon(Google);
const TwitterIcon = withHoverableIcon(Twitter);
const FacebookIcon = withHoverableIcon(Facebook);

const Authentication: FC<RouteComponentProps> = ({ history }) => {
  const { dark: isDarkMode } = useContext(ThemeContext) as any;
  const checkAccountExistence = functions().httpsCallable("doesAccountExist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInMode, setSignInMode] = useState<"login" | "register" | void>();
  const [showSpinner, setShowSpinner] = useState<"local" | "social" | false>(false);
  const [localAuthError, setLocalAuthError] = useState("");
  const [socialAuthError, setSocialAuthError] = useState("");
  const { current: googleProvider } = useRef(new auth.GoogleAuthProvider());
  const { current: twitterProvider } = useRef(new auth.TwitterAuthProvider());
  const { current: facebookProvider } = useRef(new auth.FacebookAuthProvider());

  useEffect(() => {
    return auth().onAuthStateChanged(account => {
      if (account) history.push("/");
    });
  });

  const authenticate = async () => {
    setShowSpinner("local");
    const [err] = await asyncCatch<firebase.auth.UserCredential, firebase.auth.Error>(
      signInMode === "register"
        ? auth().createUserWithEmailAndPassword(email, password)
        : auth().signInWithEmailAndPassword(email, password)
    );
    setShowSpinner(false);
    if (err) {
      return setLocalAuthError(err.message);
    }
  };

  const submitSignInEmail = () => {
    setShowSpinner("local");
    checkAccountExistence({ email }).then(({ data: exists }) => {
      setSignInMode(exists ? "login" : "register");
      setShowSpinner(false);
    });
  };

  const onContinue = () => {
    setLocalAuthError("");
    setSocialAuthError("");
    switch (signInMode) {
      case "login":
      case "register":
        return authenticate();
      default:
        return submitSignInEmail();
    }
  };

  const socialSignIn = async (provider: auth.TwitterAuthProvider | auth.GoogleAuthProvider | auth.FacebookAuthProvider) => {
    setShowSpinner("social");
    const [err] = await asyncCatch<firebase.auth.UserCredential, firebase.auth.Error>(auth().signInWithPopup(provider));
    setShowSpinner(false);
    if (err) {
      setSocialAuthError(err.message);
    }
  };

  return (
    <>
      <Box fill justify="center">
        <SAuthContainer alignSelf="center" background={isDarkMode ? "#000" : "white"}>
          <SLogoContainer children={<Logo />} />
          <FormField label="Email">
            <TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!!signInMode} />
          </FormField>
          {!!signInMode && (
            <FormField label={signInMode === "login" ? "Enter your password" : "Create new password"} error={localAuthError}>
              <TextInput type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </FormField>
          )}
          <Box direction="row" align="center" justify="center" margin={{ top: "small", bottom: "large" }} gap="small">
            <Button
              onClick={onContinue}
              primary={!!signInMode}
              label={!signInMode ? "Continue" : signInMode === "login" ? "Login" : "Create account"}
              alignSelf="center"
              disabled={!!showSpinner}
            />
            {showSpinner === "local" && <Spinner />}
          </Box>
          <Text size="small" alignSelf="center" textAlign="center">
            Or sign in using a social provider
          </Text>
          <Box direction="row" gap="medium" justify="center" margin={{ top: "medium" }}>
            <Button disabled={!!showSpinner} onClick={() => socialSignIn(googleProvider)} icon={<GoogleIcon />} />
            <Button disabled={!!showSpinner} onClick={() => socialSignIn(twitterProvider)} icon={<TwitterIcon />} />
            <Button disabled={!!showSpinner} onClick={() => socialSignIn(facebookProvider)} icon={<FacebookIcon />} />
          </Box>
          {showSpinner === "social" && <Spinner />}
          {socialAuthError && <STextError children={socialAuthError} />}
        </SAuthContainer>
      </Box>
    </>
  );
};

export default Authentication;
