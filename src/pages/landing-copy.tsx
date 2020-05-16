import React, { FC, useEffect, HTMLAttributes, ImgHTMLAttributes, useContext } from "react";
import { Box, Heading, Text, BoxTypes, ResponsiveContext, Button, Grommet } from "grommet";
import Rellax from "rellax";

import LandingHero from "../components/landing-hero";
import hpTheme from "../themes/hp-theme";
import { RouteComponentProps } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { useStateSelector } from "../store";

const Landing: FC<RouteComponentProps> = ({ history }) => {
  const { account } = useStateSelector(({ auth }) => auth);

  useEffect(() => {
    if (account && !account.isAnonymous) history.push("/lysts");
  }, [account]);

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
            <Button plain onClick={() => history.push("/lysts")}>
              <Box pad={{ horizontal: "medium" }}>
                <Text color="#D39F03">My Lysts</Text>
              </Box>
            </Button>
          )}
        </Box>
        <LandingHero
          onSignUp={() =>
            !account ? history.push("/register") : account.isAnonymous ? history.push("/upgrade-account") : history.push("/lysts")
          }
        />
      </Box>
    </Grommet>
  );
};

export default Landing;
