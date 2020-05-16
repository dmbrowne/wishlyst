import React, { FC, ReactNode } from "react";
import { Box, Heading, Text, BoxTypes, Button } from "grommet";
import { StatusWarning, StatusCritical, StatusGood, StatusInfo, StatusGoodSmall, Close, FormClose } from "grommet-icons";
import BorderlessButton from "./borderless-button";
import { useTheme, DefaultTheme } from "styled-components";

type NotificationType = "success" | "warning" | "error" | "info" | "standard";

interface Props extends Omit<BoxTypes, "background" | "pad" | "gap" | "direction" | "align"> {
  kind?: NotificationType;
  title?: string;
  text?: string;
  onClick?: () => any;
  onDismiss?: () => any;
  size?: "small" | "medium";
  icon?: ReactNode;
}

const getBgColor = (theme: DefaultTheme) => (kind: NotificationType) => {
  switch (kind) {
    case "error":
      return "status-critical-bg";
    case "success":
      return "status-ok-bg";
    case "warning":
      return "status-warning-bg";
    case "info":
      return "status-info-bg";
    case "standard":
    default:
      return theme.dark ? "dark-3" : "light-3";
  }
};

const getTextColor = (theme: DefaultTheme) => (kind: NotificationType) => {
  switch (kind) {
    case "error":
      return "status-critical";
    case "success":
      return "status-ok";
    case "warning":
      return "status-warning";
    case "info":
      return "status-info";
    case "standard":
    default:
      return theme.dark ? "white" : "dark-1";
  }
};

const getIcon = (kind: NotificationType) => {
  switch (kind) {
    case "error":
      return StatusCritical;
    case "success":
      return StatusGood;
    case "warning":
      return StatusWarning;
    case "info":
      return StatusInfo;
    default:
      return StatusGoodSmall;
  }
};

const Alert: FC<Props> = ({ kind = "standard", title, text, onClick, size = "medium", icon, onDismiss }) => {
  const theme = useTheme();
  const bgColor = getBgColor(theme)(kind);
  const textColor = getTextColor(theme)(kind);
  const Icon = getIcon(kind);
  const sizes = title && text ? ["medium", "large"] : ["medium", "large"];
  const addon = icon || <Icon size={size === "small" ? sizes[0] : sizes[1]} color={textColor} />;

  return (
    <Box background={bgColor} pad={size || "medium"} direction="row" align="center" justify="between">
      <Box gap={size} direction="row" align="center">
        {addon}
        <Box>
          {title && (
            <Heading
              level={size === "small" ? 6 : 4}
              as="div"
              style={{ maxWidth: "none" }}
              size="small"
              color={textColor}
              children={title}
            />
          )}
          {text && <Text size={size} color={textColor} children={text} />}
        </Box>
      </Box>
      {onClick ? (
        <BorderlessButton label="Register" onClick={onClick} textProps={{ style: { fontWeight: 700 } }} />
      ) : onDismiss ? (
        <Button icon={<FormClose />} plain onClick={onDismiss} />
      ) : null}
    </Box>
  );
};

export default Alert;
