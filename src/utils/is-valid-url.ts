import * as yup from "yup";

export const isValidUrl = (url: string) => {
  return yup
    .string()
    .url()
    .required()
    .isValid(url);
};
