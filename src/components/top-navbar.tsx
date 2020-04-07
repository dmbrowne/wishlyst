import React, { FC, useState, useEffect } from "react";
import { ReactComponent as Logo } from "../icons/wishlystlogo.svg";
import { Box, Text, Button, Heading } from "grommet";
import styled from "styled-components";
import firebase, { auth } from "firebase/app";
import { withRouter } from "react-router-dom";

const SContainer = styled(Box).attrs({ height: "60px", pad: { horizontal: "medium", vertical: "small" } })`
  color: #fff;
  background: linear-gradient(90deg, #deb536, #e3c15f);
`;

const SAvatarImage = styled.img`
  object-fit: cover;
  border-radius: 50%;
  width: 100%;
  height: 100%;
`;

const Avatar: FC<{ name?: string; imgSrc: string } | { name: string; imgSrc?: undefined }> = (props) => (
  <Box width="40px" height="40px" background="dark-3" style={{ borderRadius: "50%" }} align="center" justify="center">
    {props.imgSrc !== undefined ? (
      <SAvatarImage src={props.imgSrc} />
    ) : (
      <Heading as="span" level={4} children={props.name.charAt(0).toUpperCase()} />
    )}
  </Box>
);

const TopNavbar = withRouter(({ history }) => {
  const [userAccount, setUserAccount] = useState<firebase.User | null>(null);
  useEffect(() => {
    auth().onAuthStateChanged((user) => {
      setUserAccount(user);
    });
  }, []);
  return (
    <SContainer direction="row" justify="between">
      <Box width="40px" />
      <Box height="100%" width="250px">
        <Logo />
      </Box>
      {userAccount ? (
        <Avatar
          {...(userAccount.photoURL
            ? { imgSrc: userAccount.photoURL }
            : { name: userAccount.displayName || userAccount.email || userAccount.uid })}
        />
      ) : (
        <Button onClick={() => history.push("/login")}>
          <Text>Login</Text>
        </Button>
      )}
    </SContainer>
  );
});

export default TopNavbar;
