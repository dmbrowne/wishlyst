import React from "react";
import { Box, Paragraph, Button } from "grommet";
import { auth } from "firebase/app";
import { useHistory } from "react-router-dom";

const Logout = () => {
  const history = useHistory();

  const signout = () => {
    auth().signOut();
    history.push("/");
  };

  return (
    <Box>
      <Paragraph size="large" children="Are you sure you want to log out?" margin={{ bottom: "large" }} />
      <Button size="large" alignSelf="start" primary color="status-critical" label="Log out" onClick={signout} />
    </Box>
  );
};

export default Logout;
