import React, { FC } from "react";
import { Box, Text, Button, Grommet } from "grommet";

import LandingHero from "./landing-hero";
import hpTheme from "../../themes/hp-theme";
import { RouteComponentProps } from "react-router-dom";
import { useStateSelector } from "../../store";

const Landing: FC<RouteComponentProps> = ({ history }) => {
  const { account } = useStateSelector(({ auth }) => auth);
  const isGuestUser = account && account.isAnonymous;
  const isFullUser = account && !account.isAnonymous;
  const signUpUrl = isGuestUser ? "/upgrade-account" : !account ? "/register" : null;
  // const signUpUrl = !account ? "/register"

  return (
    <Grommet theme={hpTheme} full>
      <Box fill background="#FCEDC2">
        <Box
          direction="row"
          margin={{ top: "small", bottom: "medium", horizontal: "auto" }}
          justify="end"
          gap="small"
          pad={{ horizontal: "medium" }}
          width={{ max: "1400px" }}
          style={{ width: "100%" }}
        >
          {!account ? (
            <>
              <Button plain onClick={() => history.push("/login")}>
                <Box pad={{ horizontal: "medium" }}>
                  <Text color="#D39F03">Login</Text>
                </Box>
              </Button>
              <Button onClick={() => history.push("/register")} primary color="brand" label={<Text color="#FCEDC2">Register</Text>} />
            </>
          ) : account.isAnonymous ? (
            <Button
              onClick={() => history.push("/upgrade-account")}
              primary
              color="brand"
              label={<Text color="#FCEDC2">Upgrade guest account</Text>}
            />
          ) : (
            <Button plain onClick={() => history.push("/app/wishlysts")}>
              <Box pad={{ horizontal: "medium" }}>
                <Text color="#D39F03">Go to my Wishlysts</Text>
              </Box>
            </Button>
          )}
        </Box>
        <LandingHero
          onSignUp={signUpUrl ? () => history.push(signUpUrl) : undefined}
          onViewLysts={isFullUser ? () => history.push("/app/wishlysts") : undefined}
        />
      </Box>
    </Grommet>
  );
};

export default Landing;
