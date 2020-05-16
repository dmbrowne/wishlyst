import React, { useState, FC, ReactNode } from "react";
import { IconProps } from "grommet-icons";
import { Box, BoxTypes } from "grommet";

function withHoverableIcon(Icon: React.ComponentType<IconProps & JSX.IntrinsicElements["svg"]>) {
  const WrappedWithHoverable: FC<IconProps & JSX.IntrinsicElements["svg"]> = props => {
    const [highlight, showHiglight] = useState(false);
    return (
      <Box fill align="center" as="span" onMouseEnter={() => showHiglight(true)} onMouseLeave={() => showHiglight(false)}>
        <Icon {...props} color={highlight ? "plain" : props.color || "dark-1"} />
      </Box>
    );
  };
  return WrappedWithHoverable;
}

export const HoverComponent: FC<BoxTypes & { children: (highlight: boolean) => ReactNode }> = ({ children, ...props }) => {
  const [highlight, showHiglight] = useState(false);
  return (
    <Box {...props} onMouseEnter={() => showHiglight(true)} onMouseLeave={() => showHiglight(false)}>
      {children(highlight)}
    </Box>
  );
};

export default withHoverableIcon;
