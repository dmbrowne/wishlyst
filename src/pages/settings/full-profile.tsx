import React, { FC, useState } from "react";
import { Heading, Box, Button } from "grommet";
import { RouteComponentProps } from "react-router-dom";
import { auth, storage } from "firebase/app";
import { Helmet } from "react-helmet";
import { Formik } from "formik";
import { object, string as yupString } from "yup";

import { db } from "../../firebase";
import ImageUpload from "../../components/image-upload";
import { IUser } from "../../@types";
import FileInput from "../../components/file-input";
import Spinner from "../../components/spinner";
import { useStateSelector } from "../../store";
import NameForm from "../../components/name-form-with-formik";
import ImageUploadPlaceholder from "../../components/image-upload-placeholder";

const ProfileSettings: FC<RouteComponentProps> = ({ history }) => {
  const { account, user } = useStateSelector(({ auth }) => auth);
  const [, setUploadPending] = useState(false);
  const updateUser = (values: Partial<Omit<IUser, "id">>) => {
    const { currentUser } = auth();
    if (currentUser) return db.doc(`users/${currentUser.uid}`).update(values);
    else return Promise.reject();
  };

  const uploadImgSuccess = (taskSnap: firebase.storage.UploadTaskSnapshot) => {
    updateUser({ thumb: taskSnap.ref.fullPath }).then(() => {
      console.log("user updated");
      setUploadPending(false);
    });
  };

  const onUploadStateChange = (taskSnap: firebase.storage.UploadTaskSnapshot) => {
    if (taskSnap.state === storage.TaskState.RUNNING) setUploadPending(true);
  };

  const validationSchema = object().shape({
    firstName: yupString().required(),
    lastName: yupString().required(),
    displayName: yupString().required(),
  });
  const onUpdateName = (values: { firstName: string; lastName: string; displayName: string }) => {
    const { currentUser } = auth();
    const userId = currentUser?.uid;
    if (!userId) throw Error("uid not found on current user");

    db.doc(`users/${userId}`).update(values);
  };

  if (!account || !user) return null;

  return (
    <>
      <Helmet>
        <title>My account - Wishlyst</title>
      </Helmet>
      <Heading margin={{ top: "small", bottom: "large" }} level={2} as="h1" children="My Profile" />
      {user && !account.isAnonymous && (
        <Box margin={{ bottom: "medium" }} height="150px">
          <ImageUpload
            name="user-avatar"
            uploadRefPath={`users/avatar_${account.uid}`}
            onUploadSuccess={uploadImgSuccess}
            onUploadStateChange={onUploadStateChange}
          >
            {({ name, onUpload, onDelete, uploadPending }) =>
              !uploadPending ? (
                <Box direction="row" align="center" gap="medium">
                  <Box width="150px" height="150px" round="full" justify="center" overflow="hidden" border={{ style: "dotted" }}>
                    <ImageUploadPlaceholder name={name} imageRef={user.thumb} onInputFileChange={onUpload} onDelete={onDelete} />
                  </Box>
                  <FileInput name={name} children={<Button as="span" label="Change" />} />
                </Box>
              ) : (
                <Spinner color="brand" size="medium" />
              )
            }
          </ImageUpload>
        </Box>
      )}

      <Formik
        name="name-form"
        onSubmit={onUpdateName}
        validationSchema={validationSchema}
        validateOnMount={true}
        validateOnChange={true}
        initialValues={{ firstName: user.firstName || "", lastName: user.lastName || "", displayName: user.displayName || "" }}
      >
        {({ isValid, isSubmitting, touched, resetForm, dirty }) => (
          <>
            <NameForm />
            <Box gap="medium" margin={{ top: "medium" }} justify="end" direction="row">
              <Button label="Cancel" disabled={!dirty} onClick={() => resetForm()} />
              <Button primary type="submit" label="Update" disabled={!dirty || !isValid || isSubmitting} />
            </Box>
          </>
        )}
      </Formik>
    </>
  );
};

export default ProfileSettings;
