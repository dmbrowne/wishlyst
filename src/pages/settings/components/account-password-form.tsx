import React, { FC } from "react";
import { Box, Button } from "grommet";
import { Formik, Form, Field, FieldProps } from "formik";
import * as yup from "yup";

import FieldInput from "../../../components/field-input";
import { useStateSelector } from "../../../store";

export interface IPasswordForm {
  onResetForm?: () => any;
  onSubmitSucess?: () => any;
}

export const PasswordForm: FC<IPasswordForm> = ({ onResetForm, onSubmitSucess }) => {
  const { account } = useStateSelector(({ auth }) => auth);
  const validationSchema = yup.object().shape({
    password: yup.string().required(),
    passwordConfirm: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required(),
  });

  const onSubmit = ({ password }: { password: string; confirmPassword: string }) => {
    if (account) {
      account.updatePassword(password).then(() => {
        if (onSubmitSucess) onSubmitSucess();
      });
    }
  };

  return (
    <Formik
      initialValues={{ password: "", confirmPassword: "" }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      validateOnMount={true}
    >
      {({ isValid, dirty, handleSubmit, resetForm }) => {
        const formReset = onResetForm || resetForm;
        return (
          <Form>
            <Field name="password">
              {({ field, meta }: FieldProps) => <FieldInput label="New password" autoComplete="new-password" type="password" {...field} />}
            </Field>
            <Field name="passwordConfirm">
              {({ field, meta }: FieldProps) => (
                <FieldInput style={{ marginTop: 16 }} label="Confirm password" autoComplete="new-password" type="password" {...field} />
              )}
            </Field>
            <Box direction="row" gap="xsmall" justify="end" margin={{ top: "small" }}>
              <Button disabled={!dirty} onClick={() => formReset()} label="Cancel" />
              <Button disabled={!isValid} primary onClick={() => handleSubmit()} label="Update" />
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};
