import React, { useContext, FC } from "react";
import { Heading, Text, Box, Button, ResponsiveContext } from "grommet";
import { ReactComponent as WishlystLogo } from "../assets/icons/wishlystlogo_colored.svg";
import { ReactComponent as GiftsMan } from "../assets/illustrations/winter-man-gifts-illustration.svg";
import styled from "styled-components";

const SignUpButton = styled(Button).attrs(() => ({
  alignSelf: "start",
  primary: true,
  hoverIndicator: "#fff",
}))`
  background: #d39f03;
  transition: all 200ms;
`;

const LandingHero: FC<{ onSignUp: () => void }> = ({ onSignUp }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const order = isMobile ? [2, 1] : [0, 2];

  return (
    <Box pad="large" background="#FCEDC2" overflow="hidden">
      <Box width={{ max: "1400px" }} margin={{ horizontal: "auto" }} style={{ width: "100%" }}>
        <Box width={{ max: "550px" }} style={{ width: "60%" }} margin={{ bottom: "large" }}>
          <WishlystLogo color="#fff" />
        </Box>
        <Box direction={isMobile ? "column" : "row"} gap={isMobile ? undefined : "large"}>
          <Box width={isMobile ? "100%" : "55%"} justify="between" style={{ order: order[0] }}>
            <Box>
              <Heading level={1}>Got a wish? Add it to a lyst</Heading>
              <Text size="large" margin={{ top: "small" }}>
                Wishlyst lets you make a list all your favourite items, and allows you to share them with others.
              </Text>
            </Box>

            <Box alignSelf="start" margin={{ top: "large", bottom: "medium" }}>
              <Box elevation="medium" alignSelf="start" style={{ borderRadius: "15px" }}>
                <SignUpButton onClick={onSignUp}>
                  <Box pad="16px" style={{ borderRadius: "15px" }}>
                    <Text textAlign="center" size={isMobile ? "medium" : "large"}>
                      Sign up to create your first wishlyst
                    </Text>
                  </Box>
                </SignUpButton>
              </Box>
              <Text textAlign="center" margin={{ top: "xsmall" }} weight={300}>
                It's free!
              </Text>
            </Box>
          </Box>
          <Box width={isMobile ? "80%" : "45%"} style={{ order: order[1], margin: "auto" }}>
            {isMobile ? <GiftsMan /> : <div style={{ width: 620, height: 406 }} children={<GiftsMan />} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingHero;
