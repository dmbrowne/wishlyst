import React, { useState, useRef } from "react";
import RegisterLoginSwitcher from "./register-login-switcher";
import { Button, Text, TextInput, Box } from "grommet";
import { functions, auth } from "firebase";
import asyncCatch from "../utils/async-catch";
import BorderlessButton from "./borderless-button";
import { FormPreviousLink } from "grommet-icons";

const ClaimModalAuth = () => {
  const { current: fireAuth } = useRef(auth());
  const [authEmail, setAuthEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [authEntryMode, setAuthEntryMode] = useState<"email" | "password">("email");
  const [signInMode, setSignInMode] = useState<"login" | "register" | null>(null);
  const [authError, setAuthError] = useState("");
  const checkAccountExistence = functions().httpsCallable("doesAccountExist");
  const authAsyncTuple = <R extends firebase.auth.UserCredential, E extends firebase.auth.Error>(asyncFunc: Promise<R>) =>
    asyncCatch<R, E>(asyncFunc);

  const login = async () => {
    setShowSpinner(true);
    const [err] = await authAsyncTuple(fireAuth.signInWithEmailAndPassword(authEmail, password));
    setShowSpinner(false);
    if (err) return setAuthError(err.message);
  };

  const register = async () => {
    setShowSpinner(true);
    const [err, account] = await authAsyncTuple(fireAuth.createUserWithEmailAndPassword(authEmail, password));
    if (account && account.user) {
      await account.user.updateProfile({ displayName });
    }
    setShowSpinner(false);
    if (err) return setAuthError(err.message);
  };

  const determineAuthMode = () => {
    setShowSpinner(true);
    checkAccountExistence({ email: authEmail }).then(({ data: exists }) => {
      setSignInMode(exists ? "login" : "register");
      setAuthEntryMode("password");
      setShowSpinner(false);
    });
  };

  const onContinue = () => {
    setAuthError("");
    switch (signInMode) {
      case "login":
        return login();
      case "register":
        return register();
      default:
        return determineAuthMode();
    }
  };

  const AuthEmail = (
    <>
      <Text as="div" size="small" textAlign="center" color="dark-4">
        or
      </Text>
      <Text size="small" margin={{ vertical: "small" }} color="dark-4" children="Enter your email to either login or register" />
      <TextInput placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
    </>
  );

  const AuthPassword = (
    <>
      {(signInMode === "register" || signInMode === "login") && (
        <BorderlessButton
          icon={<FormPreviousLink />}
          label={"Cancel"}
          textProps={{ size: "small" }}
          margin={{ bottom: "small" }}
          onClick={() => {
            setAuthEntryMode("email");
            setSignInMode(null);
          }}
        />
      )}
      {signInMode === "register" && (
        <TextInput placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
      )}
      <Text
        size="small"
        margin={{ vertical: "small" }}
        color="dark-4"
        children={signInMode === "login" ? "Enter your password to login" : "Enter a password for your new account"}
      />
      <TextInput placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
    </>
  );

  const continueButtonLabel = () => {
    switch (signInMode) {
      case "login":
        return "Login";
      case "register":
        return "Create account";
      default:
        return "Continue";
    }
  };

  return (
    <Box margin={{ top: "small" }} justify="end">
      <RegisterLoginSwitcher mode={authEntryMode} renderEmail={AuthEmail} renderPassword={AuthPassword} />
      {authError && <Text color="status-error" children={authError} margin={{ top: "small" }} />}
      <Button margin={{ top: "medium" }} primary label={continueButtonLabel()} onClick={onContinue} />
    </Box>
  );
};

export default ClaimModalAuth;
