import React, { FC, useContext, ReactNode } from "react";
import { TextInputProps, Text, TextInput, Box, ResponsiveContext } from "grommet";
import FieldInputLabel from "./field-input-label";

type TextInputType = TextInputProps & Omit<JSX.IntrinsicElements["input"], "onSelect" | "size" | "placeholder" | "ref">;
export interface IFieldInput extends TextInputType {
  label?: string | ReactNode;
  help?: string;
  error?: string | false;
  asterisk?: boolean;
  textStyle?: React.DetailedHTMLProps<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
}
const FieldInput: FC<IFieldInput> = ({ label, help, error, style, textStyle, asterisk, ...props }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const mediumSize = isMobile ? "12px" : "16px";
  const smallSize = isMobile ? "10px" : "12px";
  const textSize = props.size === "small" ? smallSize : mediumSize;

  return (
    <div style={{ flex: 1, ...style }}>
      <Box margin={{ left: "xsmall", bottom: "xsmall" }}>
        {label && (
          <FieldInputLabel size={props.size}>
            {label}
            {asterisk ? <Text color="brand" children=" *" /> : ""}
          </FieldInputLabel>
        )}
        {help && <Text color="dark-6" as="div" size={textSize} children={help} />}
      </Box>
      <TextInput {...props} style={textStyle} />
      {error && <Text margin={{ left: "xsmall" }} color="status-error" as="div" size={textSize} children={error} />}
    </div>
  );
};

export default FieldInput;
