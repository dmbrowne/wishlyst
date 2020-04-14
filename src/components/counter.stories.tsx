import React from "react";
import Counter from "./counter";
import { number } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

export default {
  title: "Components|Counter",
  component: Counter
};

export const Main = () => <Counter max={number("max", 3)} min={number("min", 1)} value={4} onChange={action("onChange")} />;
