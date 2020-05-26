import React, { FC } from "react";
import { Box } from "grommet";
import { Field, FieldProps } from "formik";
import FieldInput from "./field-input";

interface IProps {
  onFirstNameChange?: (val: string) => boolean;
  onLastNameChange?: (val: string) => boolean;
}

const NameForm: FC<IProps> = ({ onFirstNameChange, onLastNameChange }) => {
  return (
    <>
      <Box direction="row" gap="small" margin={{ top: "large", bottom: "medium" }}>
        <Field name="firstName">
          {({ field }: FieldProps) => {
            const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const update = onFirstNameChange ? onFirstNameChange(e.target.value) : true;
              if (update) field.onChange(e);
            };
            return <FieldInput {...field} onChange={onChange} style={{ flex: 1 }} label="First name" autoComplete="given-name" />;
          }}
        </Field>
        <Field name="lastName">
          {({ field }: FieldProps) => {
            const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const update = onLastNameChange ? onLastNameChange(e.target.value) : true;
              if (update) field.onChange(e);
            };
            return <FieldInput {...field} onChange={onChange} style={{ flex: 1 }} label="Last name" autoComplete="family-name" />;
          }}
        </Field>
      </Box>
      <Field name="displayName">
        {({ field }: FieldProps) => (
          <FieldInput
            {...field}
            style={{ flex: 1 }}
            help="This will be shown on items you claim"
            label="Display name"
            autoComplete="nickname"
          />
        )}
      </Field>
    </>
  );
};

export default NameForm;
