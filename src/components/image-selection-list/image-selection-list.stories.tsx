import React from "react";
import ImageSelectionList from ".";
import { Box } from "grommet";

export default {
  title: "Components|Image selection list",
  component: ImageSelectionList,
};

export const Main = () => (
  <div>
    <Box margin={{ vertical: "large", horizontal: "medium" }}>
      <ImageSelectionList
        uploadRefPath="test/stories/image-selection-list"
        onSelectImage={() => Promise.resolve()}
        name="image-selection-story"
        onDeleteImageSuccess={() => {}}
      />
    </Box>
  </div>
);
