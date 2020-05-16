import React, { FC, useEffect, HTMLAttributes, ImgHTMLAttributes, useContext } from "react";
import { Box, Heading, Text, BoxTypes, ResponsiveContext, Button } from "grommet";
import Rellax from "rellax";
import styled from "styled-components";

import LandingHero from "../components/landing-hero";
import LandingFeatures from "../components/landing-features";
import HowItWorks from "../components/landing-how-it-works";
import SObjectFitImage from "../styled-components/object-fit-image";

const SignUpButton = styled(Button).attrs(() => ({
  alignSelf: "start",
  primary: true,
  hoverIndicator: "#fff",
}))`
  background: #d39f03;
  transition: all 200ms;
`;

const SGradientBG = styled(Box as FC<BoxTypes & { padBottom?: boolean }>)`
  padding-bottom: 100px;
  background: linear-gradient(
    180deg,
    rgba(238, 253, 95, 0) 0%,
    rgba(238, 253, 95, 0.05) 7%,
    rgba(227, 227, 106, 0.2) 30%,
    rgba(206, 177, 128, 0.48) 52%,
    rgba(152, 130, 68, 0.54) 72%,
    rgba(152, 130, 68, 0.46) 84%,
    rgba(152, 130, 68, 0.29) 92%,
    rgba(152, 130, 68, 0) 100%
  );

  @media screen and (min-width: 420px) {
    padding-bottom: 250px;
    background: url(/imgs/landing-bottom.svg) no-repeat bottom center,
      linear-gradient(
        180deg,
        rgba(238, 253, 95, 0) 0%,
        rgba(238, 253, 95, 0.05) 7%,
        rgba(227, 227, 106, 0.2) 30%,
        rgba(206, 177, 128, 0.48) 52%,
        rgba(152, 130, 68, 0.54) 72%,
        rgba(152, 130, 68, 0.46) 84%,
        rgba(152, 130, 68, 0.29) 92%,
        rgba(152, 130, 68, 0) 100%
      );
  }
`;

const Landing = () => {
  const isMobile = useContext(ResponsiveContext) === "small";

  useEffect(() => {
    new Rellax(".rellax", {
      speed: -0.5,
      center: false,
      wrapper: null,
      round: true,
      vertical: true,
      horizontal: true,
    });
  }, []);

  return (
    <Box>
      <LandingHero onSignUp={() => {}} />
      <LandingFeatures />
      <HowItWorks />
      <Box background="white" pad={{ vertical: "xlarge", horizontal: "large" }} height={{ min: "90vh" }} justify="evenly">
        <Heading textAlign="center" level={2} margin={{ bottom: "xlarge" }} style={{ maxWidth: "none" }}>
          Useful for any occassion
        </Heading>

        <Box direction="row" gap="small" wrap={false} justify="evenly">
          <div>
            <SObjectFitImage src="/imgs/stock-photo-bride-s-high-heel-shoes-on-sofa-385668106.jpg" />
          </div>
          <div>
            <SObjectFitImage src="/imgs/stock-photo-girl-s-hands-holding-beautiful-flowers-bouquet-bombastic-roses-blue-eringium-eucalyptus-680404243.jpg" />
          </div>
          <div>
            <SObjectFitImage src="/imgs/stock-photo-wedding-dress-embroidered-with-crystals-and-pearls-hangs-on-the-white-wardrobe-462514900.jpg" />
          </div>
          <div>
            <SObjectFitImage src="/imgs/stock-photo-wedding-favors-and-wedding-ring-on-on-colored-background-1404284318.jpg" />
          </div>
        </Box>
        <Box>
          <Heading textAlign="center" level={3} margin={{ horizontal: "auto", vertical: "medium" }}>
            Weddings
          </Heading>
          <Text textAlign="center" style={{ maxWidth: 500 }} margin={{ horizontal: "auto" }}>
            Create a gift registry, or a list of items that the bridal / groom party need to purchase in order to make your special day
            perfect
          </Text>
        </Box>
      </Box>
      <Box background="white" overflow="hidden">
        <SGradientBG pad={{ bottom: "xlarge", top: "xxlarge", horizontal: "large" }} overflow="hidden" padBottom={!isMobile}>
          <Heading level={2} children="Share your wishes today" textAlign="center" margin={{ bottom: "medium", horizontal: "auto" }} />
          <Text textAlign="center" style={{ maxWidth: 600 }} margin={{ horizontal: "auto" }}>
            Create an account to let your freinds, family and loved ones know everything that you want, and recieve eveything you’ve wished
            for.
          </Text>
          <Box alignSelf="center">
            <SignUpButton margin={{ top: "large" }}>
              <Box pad={{ vertical: "8px", horizontal: "16px" }} style={{ borderRadius: "15px" }}>
                <Text textAlign="center">Get started</Text>
              </Box>
            </SignUpButton>
          </Box>
        </SGradientBG>
      </Box>
      <Box background="#fff" pad="small" height="150px" />
    </Box>
  );
};

export default Landing;
