import React, { useState, FC, ReactNode } from "react";
import { Box, Heading, Text, TextInput, Button } from "grommet";
import ClaimModalAuth from "./claim-modal-auth";
import { useTheme } from "styled-components";
import SocialLogin from "./social-login";
import { auth } from "firebase";

interface Props {
  onAnnoymousLogin?: (displayName: string) => any;
  onAnonymousSignInSuccess?: () => any;
  guestContent?: ReactNode;
  showGuestSection?: boolean;
  showAuthSection?: boolean;
}

const UnauthenticatedClaimModalContent: FC<Props> = ({
  onAnnoymousLogin,
  onAnonymousSignInSuccess,
  guestContent,
  showGuestSection = true,
  showAuthSection = true,
}) => {
  const { dark, layer } = useTheme();
  const [name, setName] = useState("");

  const anoymousRegister = (displayName: string) => {
    auth()
      .signInAnonymously()
      .then(({ user }) => {
        if (user) {
          user.updateProfile({ displayName }).then(() => {
            if (onAnonymousSignInSuccess) onAnonymousSignInSuccess();
          });
        }
      });
  };

  const anonymousSignIn = onAnnoymousLogin || anoymousRegister;
  return (
    <Box direction="row">
      {showAuthSection && (
        <Box background={dark ? "dark-2" : "light-1"} style={{ flex: 1 }} pad="medium">
          <Heading level={4} margin={{ top: "none" }} children="Login / Register" />
          <SocialLogin />
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
  );
};

export default UnauthenticatedClaimModalContent;
