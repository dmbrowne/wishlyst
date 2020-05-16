import React from "react";
import Alert from "./alert";

export default {
  title: "Components|Alert",
  component: Alert,
};

export const Warning = () => <Alert kind="warning" title="Notifcation title" text="notification text" />;
export const ErrorStatus = () => <Alert kind="error" title="Notifcation title" text="notification text" />;
export const Success = () => <Alert kind="success" title="Notifcation title" text="notification text" />;
export const Info = () => <Alert kind="info" title="Notifcation title" text="notification text" />;
export const Standard = () => <Alert kind="standard" title="Notifcation title" text="notification text" />;
