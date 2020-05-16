import React, { useState, useRef } from "react";
import { Button, Text, TextInput, Box } from "grommet";
import { auth } from "firebase/app";
import asyncCatch from "../utils/async-catch";
import Spinner from "./spinner";

const ClaimModalAuth = () => {
  const { current: fireAuth } = useRef(auth());
  const [authEmail, setAuthEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [authError, setAuthError] = useState("");
  const authAsyncTuple = <R extends firebase.auth.UserCredential, E extends firebase.auth.Error>(asyncFunc: Promise<R>) =>
    asyncCatch<R, E>(asyncFunc);

  const login = async () => {
    setShowSpinner(true);
    const [err] = await authAsyncTuple(fireAuth.signInWithEmailAndPassword(authEmail, password));
    setShowSpinner(false);
    if (err) return setAuthError(err.message);
  };

  if (showSpinner) {
    return <Spinner color="brand" />;
  }

  return (
    <Box margin={{ top: "small" }} justify="end">
      <Box gap="small">
        <TextInput size="small" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
        <TextInput size="small" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </Box>
      {authError && <Text color="status-error" children={authError} margin={{ top: "small" }} />}
      <Button margin={{ top: "medium" }} primary label="Login" onClick={login} />
    </Box>
  );
};

export default ClaimModalAuth;
