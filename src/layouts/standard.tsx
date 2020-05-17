import React, { FC } from "react";
import { Box } from "grommet";
import TopNavbar from "../components/top-navbar";

const StandardLayout: FC = ({ children }) => {
  return (
    <Box height={{ min: "100%" }} style={{ display: "block" }}>
      <TopNavbar />
      <Box pad="medium" children={children} />
    </Box>
  );
};

export default StandardLayout;
