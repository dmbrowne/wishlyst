import React, { useContext, FC } from "react";
import { Text, ResponsiveContext, TextProps } from "grommet";

type TextType = TextProps & Omit<JSX.IntrinsicElements["span"], "color">;
interface IProps extends TextType {}

const FieldInputLabel: FC<IProps> = ({ children, size, ...props }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const mediumSize = isMobile ? "12px" : "16px";
  const smallSize = isMobile ? "10px" : "12px";
  const textSize = size === "small" ? smallSize : mediumSize;
  return (
    <Text as="label" size={textSize} {...props}>
      {children}
    </Text>
  );
};

export default FieldInputLabel;
