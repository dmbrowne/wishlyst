import React, { useState, FC, ReactNode, useContext } from "react";
import { Box, Heading, Text, TextInput, Button } from "grommet";
import ClaimModalAuth from "./claim-modal-auth";
import { useTheme } from "styled-components";
import SocialLogin from "./social-login";
import { auth } from "firebase/app";
import { GuestProfileContext } from "../context/guest-profile";
import { AuthContext } from "../context/auth";
import { useHistory } from "react-router-dom";

interface Props {
  onAnnoymousLogin?: (displayName: string) => any;
  onAnonymousSignInSuccess?: () => any;
  guestContent?: ReactNode;
  showGuestSection?: boolean;
  showAuthSection?: boolean;
  redirectQueryString?: string;
}

const UnauthenticatedClaimModalContent: FC<Props> = props => {
  const {
    onAnnoymousLogin,
    onAnonymousSignInSuccess,
    guestContent,
    showGuestSection = true,
    showAuthSection = true,
    redirectQueryString = "",
  } = props;
  const history = useHistory();
  const { forceUpdate } = useContext(AuthContext);
  const { dark, layer } = useTheme();
  const [name, setName] = useState("");

  const anonymousSignIn = onAnnoymousLogin
    ? onAnnoymousLogin
    : (displayName: string) => {
        auth()
          .signInAnonymously()
          .then(({ user }) => {
            if (!user) return;
            user.updateProfile({ displayName }).then(() => {
              setTimeout(() => forceUpdate(), 500);
              if (onAnonymousSignInSuccess) onAnonymousSignInSuccess();
            });
          });
      };

  const goToRegister = () => {
    history.push("/register?" + redirectQueryString);
  };

  return (
    <Box>
      <Button plain label="Sign up for an account" color="brand" margin={{ bottom: "medium" }} onClick={goToRegister} />
      <Box direction="row">
        {showAuthSection && (
          <Box background={dark ? "dark-2" : "light-1"} style={{ flex: 1 }} pad="medium">
            <Heading level={4} margin={{ top: "none" }} children="Login" />
            <ClaimModalAuth />
          </Box>
        )}
        {showGuestSection && (
          <Box background={layer?.background} style={{ flex: 1 }} pad="medium" justify="between">
            <div>{guestContent}</div>
            <Box gap="small" justify="end">
              <TextInput placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              <Button margin={{ top: "small" }} label="Continue" onClick={() => anonymousSignIn(name)} />
            </Box>
          </Box>
        )}
      </Box>
      <Box margin={{ top: "medium" }}>
        <Text as="div" size="small" textAlign="center" color="dark-4" margin={{ bottom: "xsmall" }} children="or" />
        <SocialLogin />
      </Box>
    </Box>
  );
};

export default UnauthenticatedClaimModalContent;
