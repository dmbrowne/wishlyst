import React, { FC, ReactElement } from "react";
import { Button, Box, Text, ButtonType } from "grommet";
import { useTheme } from "styled-components";
import { ColorType } from "grommet/utils";

export interface ICircleButton extends ButtonType {
  backgroundColorType: ColorType;
  icon?: ReactElement;
}

const CircleButton: FC<ICircleButton> = ({ label, backgroundColorType, icon, ...props }) => {
  const { dark } = useTheme();
  return (
    <Button as="span" {...props}>
      <Box align="center" pad="small">
        <Box background={backgroundColorType} pad="medium" style={{ borderRadius: "50%" }}>
          {icon}
        </Box>
        {label && typeof label === "string" ? (
          <Text textAlign="center" color={dark ? "dark-6" : "dark-3"} size="small" margin={{ top: "xsmall" }} children={label} />
        ) : null}
      </Box>
    </Button>
  );
};

export default CircleButton;
