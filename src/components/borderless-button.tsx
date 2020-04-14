import React, { FC } from "react";
import { Text, Button, Box, ButtonProps, TextProps } from "grommet";

interface IBorderlessButtonProps extends ButtonProps, Omit<JSX.IntrinsicElements["button"], "color"> {
  textProps?: TextProps & Omit<JSX.IntrinsicElements["span"], "color">;
}

export const BorderlessButton: FC<IBorderlessButtonProps> = ({ label, icon, textProps, color, ...props }) => (
  <Button {...props}>
    <Box direction="row" align="center" gap="xsmall">
      {icon}
      <Text color={color} children={label} {...textProps} />
    </Box>
  </Button>
);

export default BorderlessButton;
