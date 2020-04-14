import React from "react";
import { select } from "@storybook/addon-knobs";
import RegisterLoginSwitcher from "./register-login-switcher";
import { TextInput } from "grommet";

export default {
  title: "Components|Register Login Switcher",
  component: RegisterLoginSwitcher
};

export const Main = () => (
  <div style={{ maxWidth: 600, margin: "60px auto" }}>
    <RegisterLoginSwitcher
      mode={select("mode", ["email", "password"], "email")}
      renderEmail={<TextInput placeholder="email" />}
      renderPassword={<TextInput placeholder="password" type="password" />}
    />
  </div>
);
