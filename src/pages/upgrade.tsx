import React, { useRef, useContext, useState, FC, useEffect } from "react";
import { useTheme } from "styled-components";
import { RouteComponentProps } from "react-router-dom";
import { Heading, Box, Button, Text } from "grommet";
import * as yup from "yup";
import { Formik, Field, FieldProps, Form } from "formik";
import { Helmet } from "react-helmet";

import { useStateSelector } from "../store";
import { AuthContext } from "../context/auth";
import Spinner from "../components/spinner";
import { SocialLoginLayout, SocialProvider } from "../components/social-login";
import Modal from "../components/modal";
import BorderlessButton from "../components/borderless-button";
import { GuestProfileContext } from "../context/guest-profile";
import FieldInput from "../components/field-input";

const emailPasswordValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string().required(),
});

const Upgrade: FC<RouteComponentProps> = ({ history }) => {
  const { dark } = useTheme();
  const [accountLinkPending, setAccountLinkPending] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const { convertAnonymousToEmailPassword, convertAnonymousWithSocialProvider } = useContext(AuthContext);
  const { account, initialFetched } = useStateSelector(({ auth }) => auth);
  const { guestProfile } = useContext(GuestProfileContext);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  if (!initialFetched) return <Spinner />;

  if (!account) {
    history.push("/login");
    return null;
  }

  if (!account.isAnonymous && !mounted.current) {
    history.push("/my-account");
    return null;
  }

  const onSocialConvert = (provider: SocialProvider) => {
    setAccountLinkPending(true);
    convertAnonymousWithSocialProvider(provider, guestProfile || undefined)
      .then(() => setSuccessModal(true))
      .catch(e => window.alert(e.message))
      .finally(() => setAccountLinkPending(false));
  };

  const initialValues = { email: "", password: "" };

  const onSubmitEmailPassword = ({ email, password }: typeof initialValues) => {
    setAccountLinkPending(true);
    convertAnonymousToEmailPassword({ email, password }, guestProfile || undefined)
      .then(() => {
        setSuccessModal(true);
      })
      .catch(e => window.alert(e.message))
      .finally(() => setAccountLinkPending(false));
  };

  const goToAccount = () => history.push("/my-account");

  return (
    <div>
      <Helmet>
        <title>Create full account - Wishlyst</title>
      </Helmet>
      <Box width={{ max: "800px" }} style={{ margin: "auto", width: "100%", display: "block" }}>
        <Heading level={1} children="Create full account" textAlign="center" />

        <Formik
          initialValues={initialValues}
          onSubmit={onSubmitEmailPassword}
          validateOnChange={true}
          validationSchema={emailPasswordValidationSchema}
        >
          {formikProps => (
            <Form>
              <Box pad="medium" margin={{ top: "medium" }}>
                <FieldInput
                  label="Name"
                  help="To be displayed on claimed items (this can be changed later)"
                  value={account.displayName || ""}
                  disabled={true}
                />
              </Box>

              <Box background={dark ? "dark-1" : "light-2"} pad="medium" margin={{ top: "medium" }}>
                <Field name="email">
                  {({ field, meta }: FieldProps) => (
                    <FieldInput type="email" label="Email" error={meta.touched && meta.error} {...field} disabled={accountLinkPending} />
                  )}
                </Field>
                <Field name="password">
                  {({ field, meta }: FieldProps) => (
                    <FieldInput
                      type="password"
                      label="Password"
                      error={meta.touched && meta.error}
                      {...field}
                      disabled={accountLinkPending}
                    />
                  )}
                </Field>
                <Box direction="row" align="center" justify="center" gap="xsmall">
                  <Button
                    primary
                    label="Register"
                    margin={{ top: "medium" }}
                    type="submit"
                    disabled={!formikProps.isValid || accountLinkPending}
                  />
                  {accountLinkPending && <Spinner />}
                </Box>
              </Box>
            </Form>
          )}
        </Formik>

        <Text children="or" margin={{ vertical: "large" }} as="div" textAlign="center" />
        <Box background={dark ? "dark-1" : "light-2"} pad="medium">
          <SocialLoginLayout onSocialSignIn={onSocialConvert} />
        </Box>
      </Box>

      {successModal && (
        <Modal title="Account upgrade successful" onClose={goToAccount} layerProps={{ onEsc: goToAccount, onClickOutside: goToAccount }}>
          <BorderlessButton label="Continue to account" onClick={goToAccount} />
        </Modal>
      )}
    </div>
  );
};

export default Upgrade;
