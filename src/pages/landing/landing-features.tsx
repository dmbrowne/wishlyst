import React from "react";
import { Box, Heading, Text } from "grommet";
import styled from "styled-components";
import SObjectFitImage from "../../styled-components/object-fit-image";

const GradientFigureBg = styled(Box)`
  background-image: linear-gradient(212deg, #fcd12a 0%, #f8e473 100%);
  border-radius: 12px;
  position: absolute;
  width: 90%;
  height: 105%;
  top: calc(0px - 2.5%);
  z-index: 1;
  left: -10px;
`;

const LandingFeatures = () => {
  return (
    <Box background="white">
      <Box width={{ max: "1400px" }} margin="auto" pad={{ vertical: "xlarge", horizontal: "large" }}>
        <Box direction="row" gap="xlarge" align="center" margin={{ vertical: "large" }}>
          <Box width="50%">
            <Heading level={2} margin={{ top: "0" }} as="h3" children="Automatic image and title" />
            <Text>
              Take the hassle out of finding, downloading then uploading images to display your items. Wishlyst automatically grabs an image
              and title from the given url
            </Text>
          </Box>
          <Box width="40%" style={{ position: "relative" }}>
            <SObjectFitImage className="rellax" src="/imgs/lystitem-edit-card.svg" style={{ position: "relative", zIndex: 2 }} />
            <GradientFigureBg />
          </Box>
        </Box>

        <Box direction="row" gap="xlarge" align="center" margin={{ vertical: "large" }}>
          <Box width="40%" style={{ position: "relative" }}>
            <SObjectFitImage src="/imgs/claim-wall-light.svg" style={{ position: "relative", zIndex: 2 }} />
          </Box>
          <Box width="50%">
            <Heading level={2} margin={{ top: "0" }} as="h3" children="Claiming items made simple" />
            <Text>
              Your favourite items can be claimed by anyone you send your wishlyst to. What’s more, your freinds and family don’t need an
              account to claim items for you!
            </Text>
          </Box>
        </Box>

        <Box direction="row" gap="xlarge" margin={{ vertical: "large" }} justify="stretch">
          <Box width="50%">
            <Heading level={2} margin={{ top: "0" }} as="h3" children="All you need to know at a glance" />
            <Text>Easily see what has been claimed by friends and family and what items are outstanding</Text>
          </Box>
          <Box width="40%" height={{ min: "200px" }} style={{ position: "relative" }} background="light-6" align="center" justify="center">
            <Text size="large" color="dark-6">
              Image coming soon...
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingFeatures;
