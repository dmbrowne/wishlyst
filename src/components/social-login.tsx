import React, { useRef, FC, useContext, useState } from "react";

import { Box, Button, ResponsiveContext } from "grommet";
import asyncCatch from "../utils/async-catch";
import { auth, functions } from "firebase/app";
import hoverSocialButton from "../pages/hover-social-button";

export type SocialProvider = auth.TwitterAuthProvider | auth.GoogleAuthProvider | auth.FacebookAuthProvider;
export type SocialPlatform = "google" | "twitter" | "facebook";

interface ISocialLoginLayoutProps {
  onSocialSignIn: (provider: SocialProvider) => any;
  disabled?: boolean;
}

export const SocialLoginLayout: FC<ISocialLoginLayoutProps> = ({ onSocialSignIn, disabled }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const FacebookSignIn = hoverSocialButton("facebook", onSocialSignIn);
  const TwitterSignIn = hoverSocialButton("twitter", onSocialSignIn);
  const GoogleSignIn = hoverSocialButton("google", onSocialSignIn);

  return (
    <Box direction={isMobile ? "column" : "row"} gap="medium" justify="center">
      <GoogleSignIn disabled={disabled} />
      <TwitterSignIn disabled={disabled} />
      <FacebookSignIn disabled={disabled} />
    </Box>
  );
};
const SocialLogin = () => {
  const createUserProfile = functions().httpsCallable("createUserProfile");
  const [signInPending, setSignInPending] = useState(false);

  const socialSignIn = async (provider: SocialProvider) => {
    setSignInPending(true);
    const [err, account] = await asyncCatch(auth().signInWithPopup(provider));
    if (err) return;
    await createUserProfile({ uid: account?.user?.uid });
    setSignInPending(false);
    return true;
  };

  return <SocialLoginLayout disabled={signInPending} onSocialSignIn={socialSignIn} />;
};

export default SocialLogin;
