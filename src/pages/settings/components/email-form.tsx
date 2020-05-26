import React, { FC } from "react";
import { Box, Button } from "grommet";
import { Formik, Form, Field, FieldProps } from "formik";
import * as yup from "yup";

import FieldInput from "../../../components/field-input";
import { useStateSelector } from "../../../store";
import { useDispatch } from "react-redux";
import { fetchAccountSuccess } from "../../../store/account";

interface IEmailForm {
  email: string;
  onSubmitSucess?: () => any;
  onResetForm?: () => any;
}

export const EmailForm: FC<IEmailForm> = ({ email, onSubmitSucess, onResetForm }) => {
  const dispatch = useDispatch();
  const { account } = useStateSelector(({ auth }) => auth);
  const emailValidationSchema = yup.object().shape({
    // prettier-ignore
    email: yup.string().email().required()
  });
  const updateEmail = ({ email }: { email: string }) => {
    if (account) {
      account.updateEmail(email).then(() => {
        dispatch(fetchAccountSuccess({ ...account, email }));
        if (onSubmitSucess) onSubmitSucess();
      });
    }
  };
  return (
    <Formik initialValues={{ email }} validationSchema={emailValidationSchema} onSubmit={updateEmail} validateOnMount={true}>
      {({ isValid, dirty, handleSubmit, resetForm }) => (
        <Form>
          <Field name="email">
            {({ field, meta }: FieldProps) => <FieldInput label="Email" autoComplete="email" type="email" {...field} />}
          </Field>
          <Box direction="row" gap="xsmall" justify="end" margin={{ top: "small" }}>
            <Button disabled={!dirty} onClick={() => (onResetForm ? onResetForm() : resetForm())} label="Cancel" />
            <Button disabled={!dirty || !isValid} primary onClick={() => handleSubmit()} label="Update" />
          </Box>
        </Form>
      )}
    </Formik>
  );
};
