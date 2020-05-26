import React from "react";
import { Box, Heading, Text } from "grommet";
import { ReactComponent as CreateListImage } from "../assets/illustrations/create-list.svg";
import { ReactComponent as Shopping } from "../assets/illustrations/shopping.svg";
import { ReactComponent as Share } from "../assets/illustrations/businessman-share.svg";

const HowItWorks = () => {
  return (
    <Box background="#FFFDD0" overflow="hidden" height={{ min: "80vh" }} justify="center">
      <Box
        width={{ max: "1400px" }}
        style={{ width: "100%" }}
        margin={{ horizontal: "auto", vertical: "xlarge" }}
        pad={{ horizontal: "large" }}
      >
        <Heading level={2} children="How it works" textAlign="center" margin={{ top: "0", bottom: "15vh" }} style={{ maxWidth: "none" }} />
        <Box direction="row" justify="between" gap="medium">
          <Box width={{ max: "300px" }}>
            <div style={{ width: "100%" }} children={<CreateListImage />} />
            <Heading level={4} textAlign="center" margin={{ vertical: "medium" }} children="1. Create a wishliyst" />
            <Text textAlign="center">Start off by creating a wishlist and giving it a name</Text>
          </Box>
          <Box width={{ max: "300px" }}>
            <div style={{ width: "100%" }} children={<Shopping />} />
            <Heading level={4} textAlign="center" margin={{ vertical: "medium" }} children="2. Add your favourite items" />
            <Text textAlign="center">Add all the items you want to the new list</Text>
          </Box>
          <Box width={{ max: "300px" }}>
            <div style={{ width: "100%" }} children={<Share />} />
            <Heading level={4} textAlign="center" margin={{ vertical: "medium" }} children="3. Share your list" />
            <Text textAlign="center">When you’re done, share it with your friends and family</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HowItWorks;
