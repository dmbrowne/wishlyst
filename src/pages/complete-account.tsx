import React, { useState, FC } from "react";
import { Box, Heading, Button } from "grommet";
import qs from "query-string";
import { useTheme } from "styled-components";
import { RouteComponentProps, Link } from "react-router-dom";
import { functions } from "firebase/app";

import { ReactComponent as Logo } from "../assets/icons/wishlystlogo.svg";
import { SAuthContainer } from "../styled-components/auth-container";
import Spinner from "../components/spinner";
import { STextError } from "../styled-components/text-error";
import { useStateSelector } from "../store";
import { Formik, Form } from "formik";
import { object, string as yupString } from "yup";
import NameForm from "../components/name-form-with-formik";

const CompleteAccount: FC<RouteComponentProps> = ({ location, history }) => {
  const { dark } = useTheme();
  const [createProfileError, setCreateProfileError] = useState("");
  const { account, user } = useStateSelector(({ auth }) => auth);
  const createUserProfile = functions().httpsCallable("createUserProfile");
  const redirectUrl = qs.parse(location.search).redirect;
  const loginSuccessUrl = Array.isArray(redirectUrl) ? redirectUrl[0] : redirectUrl || "/app/wishlysts";

  const validationSchema = object().shape({
    firstName: yupString().required(),
    lastName: yupString().required(),
    displayName: yupString().required(),
  });

  const onSubmit = ({ firstName, lastName, displayName }: { firstName: string; lastName: string; displayName: string }) => {
    if (!account) return Promise.reject("Not signed in");

    const create = () => createUserProfile({ uid: account.uid, firstName, lastName, displayName });

    return validationSchema
      .isValid({ firstName, lastName, displayName })
      .then(isValid => (isValid ? create() : Promise.reject()))
      .then(() => history.push(loginSuccessUrl))
      .catch(e => setCreateProfileError(e.message));
  };

  if (!user) {
    return (
      <Box fill justify="center" align="center">
        <Spinner color="brand" />
      </Box>
    );
  }

  return (
    <Box height={{ min: "100vh" }} background={dark ? undefined : "white"}>
      <Box height="80px" align="center" pad={{ vertical: "small" }} margin={{ vertical: "large" }}>
        <Link to="/" style={{ height: "100%" }}>
          <Logo height="inherit" color={dark ? "white" : "black"} />
        </Link>
      </Box>
      <SAuthContainer pad={{ horizontal: "medium", vertical: "large" }}>
        <Heading level={3} textAlign="center" alignSelf="center">
          Enter your name to complete your account
        </Heading>

        <Formik
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          initialValues={{ firstName: user.firstName || "", lastName: user.lastName || "", displayName: user.displayName || "" }}
        >
          {({ values, touched, isValid, isSubmitting, setFieldValue }) => {
            const buildDefaultDisplayName = (firstName: string, lastName: string) => {
              if (!touched.displayName || !values.displayName) {
                setFieldValue("displayName", `${firstName ? firstName : ""}${firstName && lastName ? " " : ""}${lastName ? lastName : ""}`);
              }
              return true;
            };

            return (
              <Form style={{ display: "flex", flexDirection: "column" }}>
                <NameForm
                  onFirstNameChange={val => buildDefaultDisplayName(val, values.lastName)}
                  onLastNameChange={val => buildDefaultDisplayName(values.firstName, val)}
                />
                {createProfileError && <STextError children={createProfileError} />}
                <Button
                  type="submit"
                  primary
                  reverse
                  icon={isSubmitting ? <Spinner color="brand" /> : undefined}
                  label="Continue"
                  alignSelf="center"
                  margin={{ top: "large" }}
                  disabled={!isValid || isSubmitting}
                />
              </Form>
            );
          }}
        </Formik>
      </SAuthContainer>
    </Box>
  );
};

export default CompleteAccount;
