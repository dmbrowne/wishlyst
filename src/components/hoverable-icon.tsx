import React, { useState, FC } from "react";
import { IconProps } from "grommet-icons";

function withHoverableIcon(Icon: React.ComponentType<IconProps & JSX.IntrinsicElements["svg"]>) {
  const WrappedWithHoverable: FC<IconProps & JSX.IntrinsicElements["svg"]> = (props) => {
    const [highlight, showHiglight] = useState(false);
    return (
      <span onMouseEnter={() => showHiglight(true)} onMouseLeave={() => showHiglight(false)}>
        <Icon {...props} color={highlight ? "plain" : "dark-1"} />
      </span>
    );
  };
  return WrappedWithHoverable;
}

export default withHoverableIcon;
