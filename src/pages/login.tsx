import React, { useState, useEffect, FC, useContext } from "react";
import { Box, Text, Button, ResponsiveContext } from "grommet";
import styled from "styled-components";
import { RouteComponentProps, Link } from "react-router-dom";
import firebase, { functions, auth } from "firebase/app";
import qs from "query-string";

import Spinner from "../components/spinner";
import asyncCatch from "../utils/async-catch";
import { ReactComponent as Logo } from "../assets/icons/wishlystlogo.svg";
import { Helmet } from "react-helmet";
import hoverSocialButton from "../components/hover-social-button";
import { SAuthContainer } from "../styled-components/auth-container";
import { STextError } from "../styled-components/text-error";
import { useStateSelector } from "../store";
import FieldInput from "../components/field-input";

const SLogoContainer = styled(Box).attrs(props => ({
  margin: { horizontal: "large", bottom: "large" },
}))`
  width: 150px;
  color: ${props => props.theme.global?.colors?.brand || "#000"};

  @media screen and (min-width: 768px) {
    width: 250px;
  }
`;

const Authentication: FC<RouteComponentProps> = ({ history, location }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const createUserProfile = functions().httpsCallable("createUserProfile");
  const userAccount = useStateSelector(({ auth }) => auth.account);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSpinner, setShowSpinner] = useState<"local" | "social" | false>(false);
  const [localAuthError, setLocalAuthError] = useState("");
  const [socialAuthError, setSocialAuthError] = useState("");

  const FacebookSignIn = hoverSocialButton("facebook", socialSignIn);
  const TwitterSignIn = hoverSocialButton("twitter", socialSignIn);
  const GoogleSignIn = hoverSocialButton("google", socialSignIn);

  const formIsValid = !!email && !!password;
  const mobileStyles = { display: "block", height: "auto" };
  const desktopStyles = { minHeight: 560 };
  const redirectUrl = qs.parse(location.search).redirect;
  const loginSuccessUrl = Array.isArray(redirectUrl) ? redirectUrl[0] : redirectUrl || "/app/wishlysts";

  const login = async () => {
    setShowSpinner("local");
    const [err, account] = await asyncCatch(auth().signInWithEmailAndPassword(email, password));
    setShowSpinner(false);
    if (err) return setLocalAuthError(err.message);
    if (!account || !account.user) return setLocalAuthError("could't authenticate. account or account user not found");
  };

  async function socialSignIn(provider: auth.TwitterAuthProvider | auth.GoogleAuthProvider | auth.FacebookAuthProvider) {
    setShowSpinner("social");

    return auth()
      .signInWithPopup(provider)
      .then(account => {
        if (!account || !account.user) throw Error("no account found");
        if (account.additionalUserInfo?.isNewUser) return createUserProfile({ uid: account.user.uid });
        return Promise.resolve(undefined as any);
      })
      .catch((err: firebase.auth.Error) => setSocialAuthError(err.message))
      .finally(() => setShowSpinner(false));
  }

  useEffect(() => {
    if (!!userAccount) {
      history.push(loginSuccessUrl);
    }
  }, [history, loginSuccessUrl, userAccount]);

  return (
    <>
      <Helmet>
        <title>Sign in or register - Wishlyst</title>
      </Helmet>
      <Box fill justify={isMobile ? "start" : "center"} pad={isMobile ? "none" : "large"} style={isMobile ? mobileStyles : desktopStyles}>
        <SAuthContainer>
          <Box alignSelf="center">
            <Link to="/">
              <SLogoContainer children={<Logo />} />
            </Link>
          </Box>
          <FieldInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <FieldInput
            error={localAuthError}
            label="Enter your password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Box direction="row" align="center" justify="center" margin={{ top: "small", bottom: "large" }} gap="small">
            <Button onClick={() => login()} primary label="Login" alignSelf="center" disabled={!formIsValid || !!showSpinner} />
            {showSpinner === "local" && <Spinner color="brand" />}
          </Box>
          <Text size="small" alignSelf="center" textAlign="center" margin={{ top: "medium" }}>
            Or sign in using a social provider
          </Text>
          <Box direction={isMobile ? "column" : "row"} gap="medium" justify="center" margin={{ top: "medium" }}>
            <FacebookSignIn disabled={!!showSpinner} />
            <TwitterSignIn disabled={!!showSpinner} />
            <GoogleSignIn disabled={!!showSpinner} />
          </Box>
          {showSpinner === "social" && <Spinner />}
          {socialAuthError && <STextError children={socialAuthError} />}
        </SAuthContainer>

        <Box margin={{ top: "large" }}>
          <Button plain color="brand" label="Create an account" alignSelf="center" onClick={() => history.push("/register")} />
        </Box>
      </Box>
    </>
  );
};

export default Authentication;
