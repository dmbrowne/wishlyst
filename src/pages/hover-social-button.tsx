import React, { useRef } from "react";
import { Text, Button, ButtonType } from "grommet";
import { Google, Twitter, Facebook } from "grommet-icons";
import { auth } from "firebase/app";
import { HoverComponent } from "../components/hoverable-icon";

type SocialSignIn = (provider: auth.TwitterAuthProvider | auth.GoogleAuthProvider | auth.FacebookAuthProvider) => void;

export const hoverSocialButton = (provider: "facebook" | "twitter" | "google", socialSignIn: SocialSignIn) => (props: ButtonType) => {
  const { current: googleProvider } = useRef(new auth.GoogleAuthProvider());
  const { current: twitterProvider } = useRef(new auth.TwitterAuthProvider());
  const { current: facebookProvider } = useRef(new auth.FacebookAuthProvider());
  const Icon = provider === "facebook" ? Facebook : provider === "twitter" ? Twitter : Google;
  const activeProvider = provider === "facebook" ? facebookProvider : provider === "twitter" ? twitterProvider : googleProvider;
  const label = provider === "facebook" ? "Sign in with Facebook" : provider === "twitter" ? "Sign in with Twitter" : "Sign in with Google";
  const textHoverColor = provider === "facebook" ? "#3b5998" : provider === "twitter" ? "#00acee" : "#de5246";

  return (
    <HoverComponent>
      {hoverActive => (
        <Button
          primary
          color="white"
          onClick={() => socialSignIn(activeProvider)}
          icon={<Icon color={hoverActive ? "plain" : "dark-1"} />}
          label={<Text size="small" color={hoverActive ? textHoverColor : undefined} children={label} />}
          {...props}
        />
      )}
    </HoverComponent>
  );
};

export default hoverSocialButton;
