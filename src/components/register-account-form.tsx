import React, { useContext, FC } from "react";
import { Formik, Form, Field, FieldProps, FormikHelpers } from "formik";
import { FormField, TextInput, Box, ResponsiveContext, Button, Paragraph } from "grommet";
import * as Yup from "yup";
import Spinner from "./spinner";

export type RegisterFormValues = {
  "family-name": string;
  "given-name": string;
  email: string;
  password: string;
  "new-password": string;
};

interface IProps {
  formError?: string;
  onSubmit: (values: RegisterFormValues, formikBag: FormikHelpers<RegisterFormValues>) => void;
}

// prettier-ignore
const validationSchema = Yup.object({
  'family-name': Yup.string().required(),
  'given-name': Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().required("Password is required"),
  'new-password': Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required(),
});

const RegisterAccountForm: FC<IProps> = ({ formError, onSubmit }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const initialValues: RegisterFormValues = { "family-name": "", "given-name": "", email: "", password: "", "new-password": "" };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} isInitialValid={false} validationSchema={validationSchema}>
      {({ isValid, isSubmitting }) => (
        <Form name="register-account">
          <Box direction={isMobile ? "column" : "row"} gap="small" justify="center">
            <Field name="given-name">
              {({ field, meta: { touched, initialValue, error } }: FieldProps) => (
                <FormField style={{ flex: 1 }} label="First name" error={touched && field.value !== initialValue && error}>
                  <TextInput {...field} />
                </FormField>
              )}
            </Field>
            <Field name="family-name">
              {({ field, meta: { touched, initialValue, error } }: FieldProps) => (
                <FormField style={{ flex: 1 }} label="Last name" error={touched && field.value !== initialValue && error}>
                  <TextInput {...field} />
                </FormField>
              )}
            </Field>
          </Box>

          <Field name="email">
            {({ field, meta: { touched, initialValue, error } }: FieldProps) => (
              <FormField margin={{ vertical: "medium" }} label="Email" error={touched && field.value !== initialValue && error}>
                <TextInput type="email" {...field} />
              </FormField>
            )}
          </Field>

          <Box direction={isMobile ? "column" : "row"} gap="small" justify="center" margin={{ bottom: "large" }}>
            <Field name="password">
              {({ field, meta: { touched, initialValue, error } }: FieldProps) => (
                <FormField style={{ flex: 1 }} label="Enter your password" error={touched && field.value !== initialValue && error}>
                  <TextInput type="password" {...field} />
                </FormField>
              )}
            </Field>
            <Field name="new-password">
              {({ field, meta: { touched, initialValue, error } }: FieldProps) => (
                <FormField style={{ flex: 1 }} label="Retype your password" error={touched && field.value !== initialValue && error}>
                  <TextInput type="password" {...field} />
                </FormField>
              )}
            </Field>
          </Box>
          {formError && <Paragraph>{formError}</Paragraph>}
          <Box direction="row" align="center" justify="center" margin={{ top: "small", bottom: "large" }} gap="small">
            <Button type="submit" primary label="Create account" alignSelf="center" disabled={!isValid || isSubmitting} />
            {isSubmitting && <Spinner />}
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default RegisterAccountForm;
