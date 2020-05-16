import React, { useContext, FC, useState, useEffect, useRef } from "react";
import { Heading, FormField, TextInput, Box, Text, Button } from "grommet";
import { RouteComponentProps } from "react-router-dom";
import { firestore, auth, storage } from "firebase/app";
import { throttle } from "throttle-debounce";

import { AuthContext } from "../context/auth";
import Alert from "../components/alert";
import ImageUpload from "../components/image-upload-container";
import { IUser } from "../store/types";
import SObjectFitImage from "../styled-components/object-fit-image";
import { ThemeModeContext, ThemeMode } from "../context/theme-mode";
import { Helmet } from "react-helmet";
import FileInput from "../components/file-input";
import Spinner from "../components/spinner";
import { useStateSelector } from "../store";

const DisplayMode = () => {
  const { useDarkMode, selectedMode, changeThemeMode } = useContext(ThemeModeContext);

  const themeDisplay = (themeMode: ThemeMode) => {
    const imgSrc = themeMode === "dark" ? "/imgs/dark_theme.png" : themeMode === "auto" ? "/imgs/auto_theme.png" : "/imgs/light_theme.png";
    const isActive = selectedMode === themeMode;
    return (
      <Box onClick={() => changeThemeMode(themeMode)}>
        <Box
          border={isActive ? { size: "5px", color: "brand" } : true}
          style={{ borderRadius: 8, overflow: "hidden", position: "relative" }}
        >
          <SObjectFitImage src={imgSrc} />
          {isActive && <Box background="brand" style={{ opacity: 0.5, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />}
        </Box>
        <Heading level={6} as="span" children={themeMode} textAlign="center" margin={{ top: "small" }} />
      </Box>
    );
  };

  return (
    <Box
      background={useDarkMode ? "dark-1" : "white"}
      pad={{ bottom: "medium", horizontal: "medium" }}
      margin={{ top: "large" }}
      style={{ borderRadius: 8 }}
    >
      <Heading level={4} children="Display mode" />
      <Box direction="row" gap="medium">
        {themeDisplay("light")}
        {themeDisplay("dark")}
        {themeDisplay("auto")}
      </Box>
    </Box>
  );
};

const Account: FC<RouteComponentProps> = ({ history }) => {
  const { current: db } = useRef(firestore());
  const { forceUpdate } = useContext(AuthContext);
  const { account, user } = useStateSelector(({ auth }) => auth);
  const [name, setName] = useState(user ? user.displayName : account?.isAnonymous ? account.displayName || "" : "");
  const [uploadPending, setUploadPending] = useState(false);

  const { current: deboouncedNameUpdate } = useRef(throttle(1500, (val: string) => updateUser({ displayName: val })));

  const updateUser = (values: Partial<Omit<IUser, "id">>) => {
    const { currentUser } = auth();
    if (currentUser) db.doc(`users/${currentUser.uid}`).update(values);
  };

  const uploadImgSuccess = (taskSnap: firebase.storage.UploadTaskSnapshot) => {
    updateUser({ thumb: taskSnap.ref.fullPath });
    setUploadPending(false);
  };

  const onUploadStateChange = (taskSnap: firebase.storage.UploadTaskSnapshot) => {
    if (taskSnap.state === storage.TaskState.RUNNING) setUploadPending(true);
  };

  useEffect(() => {
    if (account && !account.isAnonymous) setName(user?.displayName || "");
  }, [user]);

  useEffect(() => {
    if (account && !account.isAnonymous) {
      deboouncedNameUpdate(name);
    } else if (account && account.isAnonymous) {
      account.updateProfile({ displayName: name });
      forceUpdate();
    }
  }, [name]);

  if (!account) return null;

  return (
    <>
      <Helmet>
        <title>My account - Wishlyst</title>
      </Helmet>
      {account?.isAnonymous && (
        <Alert
          margin={{ top: "small" }}
          kind="warning"
          title="Not signed in"
          text="You're using a partial account, register to convert to a full account"
          onClick={() => history.push("/upgrade-account")}
        />
      )}
      <Box width={{ max: "800px" }} style={{ margin: "auto", width: "100%", display: "block" }}>
        <Heading level={2} children="My account" textAlign="center" />
        {user && !account.isAnonymous && (
          <Box direction="row" align="center" gap="medium" margin={{ vertical: "medium" }}>
            <Box width="256px" height="256px" round="full" justify="center" overflow="hidden" border={{ style: "dotted" }}>
              {!uploadPending ? (
                <ImageUpload
                  name="user-avatar"
                  noThumbnailGeneration
                  uploadRefPath={`users/avatar_${account.uid}`}
                  previewImageRef={user.thumb}
                  onUploadSuccess={uploadImgSuccess}
                  onUploadStateChange={onUploadStateChange}
                />
              ) : (
                <Spinner color="brand" size="medium" />
              )}
            </Box>
            <FileInput name="user-avatar">
              <Button as="span" label="Change" />
            </FileInput>
          </Box>
        )}
        <FormField label="Name" help="Displayed on claimed items">
          <TextInput value={name} onChange={e => setName(e.target.value)} />
        </FormField>
        <DisplayMode />
      </Box>
    </>
  );
};

export default Account;
