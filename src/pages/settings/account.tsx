import React, { FC, useState } from "react";
import { Heading, Button, Text, Box } from "grommet";
import { RouteComponentProps } from "react-router-dom";

import { Helmet } from "react-helmet";
import { useStateSelector } from "../../store";
import { PasswordForm } from "./components/account-password-form";
import { DisplayMode } from "./components/display-mode";
import { EmailForm } from "./components/email-form";
import Modal from "../../components/modal";

const Account: FC<RouteComponentProps> = ({ history }) => {
  const { account } = useStateSelector(({ auth }) => auth);
  const hasPassword = account?.providerData.find(provider => provider?.providerId === "password");
  const hasEmail = account?.email;
  const [addNewEmail, setAddNewEmail] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState(false);

  if (!account) return null;

  return (
    <>
      <Helmet children={<title>My account - Wishlyst</title>} />
      <Heading margin={{ top: "small", bottom: "large" }} level={2} as="h1" children="Account settings" />
      {hasEmail && account.email ? (
        <EmailForm email={account.email} />
      ) : addNewEmail ? (
        <EmailForm email={""} onSubmitSucess={() => setAddNewEmail(false)} onResetForm={() => setAddNewEmail(false)} />
      ) : (
        <Button label="Add your email" onClick={() => setAddNewEmail(true)} />
      )}
      <Box margin={{ vertical: "large" }}>
        {!hasEmail && <Text size="small">An email is required for adding a password</Text>}
        <Button
          alignSelf="start"
          disabled={!hasEmail}
          label={!hasPassword ? "Add password" : "Change password"}
          onClick={() => setChangePasswordForm(true)}
        />
      </Box>
      <DisplayMode />
      {changePasswordForm && (
        <Modal title="Update password" onClose={() => setChangePasswordForm(false)}>
          <PasswordForm onSubmitSucess={() => setChangePasswordForm(false)} />
        </Modal>
      )}
    </>
  );
};

export default Account;
