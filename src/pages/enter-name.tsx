import React, { useState, FC, useEffect } from "react";
import { Box, Heading, TextInput, FormField, Button } from "grommet";
import qs from "query-string";
import { useTheme } from "styled-components";
import { RouteComponentProps } from "react-router-dom";
import { functions } from "firebase/app";

import { ReactComponent as Logo } from "../assets/icons/wishlystlogo.svg";
import { SAuthContainer } from "../styled-components/auth-container";
import Spinner from "../components/spinner";
import { STextError } from "../styled-components/text-error";
import { useStateSelector } from "../store";

const EnterName: FC<RouteComponentProps> = ({ location, history }) => {
  const { dark } = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [createProfileError, setCreateProfileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { account, user } = useStateSelector(({ auth }) => auth);
  const createUserProfile = functions().httpsCallable("createUserProfile");
  const redirectUrl = qs.parse(location.search).redirect;
  const loginSuccessUrl = Array.isArray(redirectUrl) ? redirectUrl[0] : redirectUrl || "/lysts";

  const onSubmit = () => {
    if (!firstName || !lastName || !account) return;
    setIsSubmitting(true);
    createUserProfile({ uid: account.uid, firstName, lastName, displayName })
      .then(() => history.push(loginSuccessUrl))
      .catch(e => setCreateProfileError(e.message))
      .finally(() => setIsSubmitting(false));
  };

  useEffect(() => {
    if (user) {
      if (user.firstName) setFirstName(user.firstName);
      if (user.lastName) setLastName(user.lastName);
      if (firstName && lastName) {
        setDisplayName(user.displayName || `${firstName} ${lastName.charAt(0)}`);
      }
    }
  }, [user]);

  if (!user) {
    return (
      <Box fill justify="center" align="center">
        <Spinner color="brand" />
      </Box>
    );
  }

  return (
    <Box height={{ min: "100vh" }} background={dark ? undefined : "white"}>
      <Box height="60px" justify="center" pad={{ vertical: "small" }} margin={{ vertical: "large" }}>
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
        <FormField style={{ flex: 1 }} label="Display name" help="This will be shown on items you claim">
          <TextInput value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </FormField>

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
