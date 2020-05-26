import React, { useState, useEffect, FC, useContext } from "react";
import { Box, Text, Button, ResponsiveContext } from "grommet";
import styled, { useTheme } from "styled-components";
import { RouteComponentProps, Link } from "react-router-dom";
import firebase, { functions, auth } from "firebase/app";
import qs from "query-string";
import { FormikHelpers } from "formik";
import { Helmet } from "react-helmet";

import Spinner from "../components/spinner";
import asyncCatch from "../utils/async-catch";
import { ReactComponent as Logo } from "../assets/icons/wishlystlogo.svg";
import hoverSocialButton from "../components/hover-social-button";
import RegisterAccountForm, { RegisterFormValues } from "../components/register-account-form";
import { SAuthContainer } from "../styled-components/auth-container";
import { STextError } from "../styled-components/text-error";
import { useStateSelector } from "../store";
import usePrevious from "../hooks/use-previous";

const SLogoContainer = styled(Box).attrs(props => ({
  margin: { horizontal: "large", bottom: "large" },
}))`
  width: 150px;
  color: ${props => props.theme.global?.colors?.brand || "#000"};

  @media screen and (min-width: 768px) {
    width: 250px;
  }
`;

const Register: FC<RouteComponentProps> = ({ history, location }) => {
  const { dark } = useTheme();
  const isMobile = useContext(ResponsiveContext) === "small";
  const createUserProfile = functions().httpsCallable("createUserProfile");
  const { account: userAccount, initialFetched } = useStateSelector(({ auth }) => auth);
  const previousInitialFetched = usePrevious(initialFetched);
  const [showSpinner, setShowSpinner] = useState<"local" | "social" | false>(false);
  const [localAuthError, setLocalAuthError] = useState("");
  const [socialAuthError, setSocialAuthError] = useState("");

  const { redirect = "/app/wishlysts", ...currentQueryMap } = qs.parse(location.search);
  const newQS = qs.stringify(currentQueryMap) || "";
  const authSuccessUri = redirect + newQS ? `?${newQS}` : "";

  const FacebookSignIn = hoverSocialButton("facebook", socialSignIn);
  const TwitterSignIn = hoverSocialButton("twitter", socialSignIn);
  const GoogleSignIn = hoverSocialButton("google", socialSignIn);

  const onFormSubmit = async (values: RegisterFormValues, formikBag: FormikHelpers<RegisterFormValues>) => {
    const errs = await formikBag.validateForm();
    if (Object.keys(errs).length) return;

    const firstName = values["family-name"];
    const lastName = values["given-name"];
    const { email, password } = values;
    const createAccount = auth().createUserWithEmailAndPassword(email, password);
    const [err, account] = await asyncCatch<firebase.auth.UserCredential, firebase.auth.Error>(createAccount);

    if (err) return setLocalAuthError(err.message);
    if (!account || !account.user) return setLocalAuthError("could't authenticate. account or account user not found");

    await createUserProfile({ uid: account?.user?.uid, firstName, lastName });
    history.push(authSuccessUri);
  };

  function socialSignIn(provider: auth.TwitterAuthProvider | auth.GoogleAuthProvider | auth.FacebookAuthProvider) {
    setShowSpinner("social");
    return auth()
      .signInWithPopup(provider)
      .then(account => {
        if (!account || !account.user) throw Error("no account found");
        return createUserProfile({ uid: account.user.uid });
      })
      .then(() => history.push(authSuccessUri))
      .catch(err => setSocialAuthError(err.message))
      .finally(() => setShowSpinner(false));
  }

  const mobileStyles = { display: "block", height: "auto" };
  const desktopStyles = { minHeight: 560 };

  useEffect(() => {
    if (!previousInitialFetched && !!userAccount) {
      history.push(authSuccessUri);
    }
  }, [authSuccessUri, history, previousInitialFetched, userAccount]);

  return (
    <>
      <Helmet children={<title>Sign up for an account - Wishlyst</title>} />
      <Box
        height={{ min: "100vh" }}
        justify={isMobile ? "start" : "center"}
        pad={isMobile ? { bottom: "large" } : "large"}
        style={isMobile ? mobileStyles : desktopStyles}
        background={dark ? undefined : "white"}
      >
        <SAuthContainer>
          <Box alignSelf="center">
            <Link to="/">
              <SLogoContainer children={<Logo />} />
            </Link>
          </Box>

          <RegisterAccountForm onSubmit={onFormSubmit} formError={localAuthError} />

          <Text margin={{ top: "medium" }} size="small" alignSelf="center" textAlign="center">
            Or sign in using a social provider
          </Text>

          <Box direction={isMobile ? "column" : "row"} gap="medium" justify="center" margin={{ top: "medium" }}>
            <GoogleSignIn disabled={!!showSpinner} />
            <TwitterSignIn disabled={!!showSpinner} />
            <FacebookSignIn disabled={!!showSpinner} />
          </Box>
          {showSpinner === "social" && <Spinner />}
          {socialAuthError && <STextError children={socialAuthError} />}
        </SAuthContainer>

        <Box margin={{ top: "large" }} align="center">
          <Button as="span">If you already have an account</Button>
          <Button plain color="brand" label="Login" onClick={() => history.push("/login")} />
        </Box>
      </Box>
    </>
  );
};

export default Register;
