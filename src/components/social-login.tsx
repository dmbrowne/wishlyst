import React, { useRef } from "react";
import { Google, Twitter, Facebook } from "grommet-icons";

import withHoverableIcon from "./hoverable-icon";
import { Box, Button } from "grommet";
import asyncCatch from "../utils/async-catch";
import { auth } from "firebase";
import { useTheme } from "styled-components";

const GoogleIcon = withHoverableIcon(Google);
const TwitterIcon = withHoverableIcon(Twitter);
const FacebookIcon = withHoverableIcon(Facebook);

const SocialLogin = () => {
  const { dark } = useTheme();
  const baseColour = dark ? "light-6" : undefined;

  const { current: googleProvider } = useRef(new auth.GoogleAuthProvider());
  const { current: twitterProvider } = useRef(new auth.TwitterAuthProvider());
  const { current: facebookProvider } = useRef(new auth.FacebookAuthProvider());

  const socialSignIn = async (provider: auth.TwitterAuthProvider | auth.GoogleAuthProvider | auth.FacebookAuthProvider) => {
    const [err] = await asyncCatch<firebase.auth.UserCredential, firebase.auth.Error>(auth().signInWithPopup(provider));
    if (err) {
    }
  };

  return (
    <Box direction="row" gap="medium" justify="center">
      <Button onClick={() => socialSignIn(googleProvider)} icon={<GoogleIcon color={baseColour} />} />
      <Button onClick={() => socialSignIn(twitterProvider)} icon={<TwitterIcon color={baseColour} />} />
      <Button onClick={() => socialSignIn(facebookProvider)} icon={<FacebookIcon color={baseColour} />} />
    </Box>
  );
};

export default SocialLogin;
