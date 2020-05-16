import React, { useState, useContext, FC } from "react";
import { Box, Heading, TextInput, FormField, Button } from "grommet";
import qs from "query-string";

import { ReactComponent as Logo } from "../assets/icons/wishlystlogo.svg";
import { SAuthContainer } from "../styled-components/auth-container";
import { RouteComponentProps } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { functions } from "firebase/app";
import Spinner from "../components/spinner";
import { STextError } from "../styled-components/text-error";
import { useStateSelector } from "../store";

const EnterName: FC<RouteComponentProps> = ({ location, history }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [createProfileError, setCreateProfileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { account } = useStateSelector(({ auth }) => auth);
  const createUserProfile = functions().httpsCallable("createUserProfile");
  const redirectUrl = qs.parse(location.search).redirect;
  const loginSuccessUrl = Array.isArray(redirectUrl) ? redirectUrl[0] : redirectUrl || "/lysts";

  const onSubmit = () => {
    if (!firstName || !lastName || !account) return;
    setIsSubmitting(true);
    createUserProfile({ uid: account.uid, firstName, lastName })
      .then(() => history.push(loginSuccessUrl))
      .catch(e => setCreateProfileError(e.message))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Box>
      <Box height="60px" justify="center" pad={{ vertical: "small" }} margin={{ bottom: "large" }}>
        <Logo />
      </Box>
      <SAuthContainer pad={{ horizontal: "medium", vertical: "large" }}>
        <Heading level={3} textAlign="center" alignSelf="center">
          Enter your name to complete your account
        </Heading>

        <Box direction="row" gap="medium" margin={{ top: "large" }}>
          <FormField style={{ flex: 1 }} label="First name">
            <TextInput value={firstName} onChange={e => setFirstName(e.target.value)} />
          </FormField>
          <FormField style={{ flex: 1 }} label="Last name">
            <TextInput value={lastName} onChange={e => setLastName(e.target.value)} />
          </FormField>
        </Box>

        {createProfileError && <STextError children={createProfileError} />}
        <Button
          primary
          reverse
          onClick={onSubmit}
          icon={isSubmitting ? <Spinner color="brand" /> : undefined}
          label="Continue"
          alignSelf="center"
          margin={{ top: "large" }}
          disabled={!firstName || !lastName || isSubmitting}
        />
      </SAuthContainer>
    </Box>
  );
};

export default EnterName;
