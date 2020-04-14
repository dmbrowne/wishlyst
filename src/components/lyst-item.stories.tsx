import React from "react";
import { LystItem } from "./lyst-item";

export default {
  title: "Components|lyst-item",
  component: LystItem
};

export const NoImage = () => <LystItem name="Item A" quantity={1} />;
NoImage.story = {
  name: "No image"
};
