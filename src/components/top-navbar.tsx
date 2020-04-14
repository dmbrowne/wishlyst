import React, { FC, useState, useEffect, useContext } from "react";
import { ReactComponent as Logo } from "../icons/wishlystlogo.svg";
import { Box, Text, Heading, Button, DropButton, ThemeContext } from "grommet";
import styled, { useTheme } from "styled-components";
import firebase, { auth } from "firebase/app";
import { withRouter, useHistory } from "react-router-dom";
import { List, Bookmark, Icon as IconType } from "grommet-icons";
import { IUser } from "../store/types";
import FirebaseImage from "./firebase-image";
import getImgThumb, { EThumbSize } from "../utils/get-image-thumb";
import { AuthContext } from "../context/auth";
import { GuestProfileContext, IGuestProfile } from "../context/guest-profile";

const SContainer = styled(Box).attrs(({ theme }) => ({
  height: "60px",
  pad: { horizontal: "medium" },
  elevation: theme.dark ? "none" : "small",
}))`
  color: #fff;
  background: ${({ theme: { dark } }) =>
    `linear-gradient(90deg,rgba(222, 181, 54,${dark ? "0.6" : "1"}),rgba(227, 193, 95, ${dark ? "0.6" : "1"}))`};
`;

const SAvatarImage = styled.img`
  object-fit: cover;
  border-radius: 50%;
  width: 100%;
  height: 100%;
`;

const Avatar: FC<{ name?: string; imgSrc: string } | { name: string; imgSrc?: undefined }> = props => (
  <Box width="40px" height="40px" background="dark-3" style={{ borderRadius: "50%" }} align="center" justify="center">
    {props.imgSrc !== undefined ? (
      <SAvatarImage src={props.imgSrc} />
    ) : (
      <Heading as="span" level={4} children={props.name.charAt(0).toUpperCase()} />
    )}
  </Box>
);

const UserMenu: FC<{ thumb?: string; displayName: string; accountPhoto?: string }> = ({ thumb, displayName, accountPhoto }) => {
  const history = useHistory();
  const { dark } = useTheme();
  return (
    <ThemeContext.Extend
      value={{
        global: { drop: { border: { radius: "12px" } }, extend: "top: 8px" },
      }}
    >
      <DropButton
        dropAlign={{ top: "bottom", right: "right" }}
        dropProps={{
          elevation: dark ? "none" : "small",
        }}
        dropContent={
          <Box width="200px" style={{ borderRadius: 12 }}>
            <Box pad="small" hoverIndicator onClick={() => history.push("/my-account")}>
              <Text>My account</Text>
            </Box>
            <Box
              pad="small"
              hoverIndicator
              onClick={() => {
                auth().signOut();
                history.push("/");
              }}
            >
              <Text>Logout</Text>
            </Box>
          </Box>
        }
      >
        {thumb ? (
          <FirebaseImage imageRef={getImgThumb(thumb, EThumbSize.small)}>{imgUrl => <Avatar imgSrc={imgUrl} />}</FirebaseImage>
        ) : accountPhoto ? (
          <Avatar imgSrc={accountPhoto} />
        ) : (
          <Avatar name={displayName} />
        )}
      </DropButton>
    </ThemeContext.Extend>
  );
};

const TopNavbar = withRouter(({ history, match }) => {
  const [account, setAccount] = useState();
  const { user } = useContext(AuthContext);
  const { guestProfile } = useContext(GuestProfileContext);

  useEffect(() => {
    return auth().onAuthStateChanged(account => {
      setAccount(account);
    });
  }, []);

  const activeBtnBorder = "rgba(255,255,255,0.6)";
  const activeBtnBg = "rgba(255,255,255,0.3)";

  const navButton = (path: string, Icon: IconType) => {
    const isActive = match.path === path;
    return (
      <Button color="white" plain onClick={() => history.push(path)}>
        <Box
          pad="xsmall"
          style={{ borderRadius: 6 }}
          {...(isActive && {
            background: activeBtnBg,
            border: { size: "small", color: activeBtnBorder },
          })}
        >
          <Icon color={isActive ? "white" : "rgba(255,255,255,0.4)"} />
        </Box>
      </Button>
    );
  };
  return (
    <SContainer direction="row" justify="between">
      <Box direction="row" gap="small" width="150px">
        {navButton("/lysts", List)}
        {navButton("/claimed", Bookmark)}
      </Box>

      <Box height="100%" width="250px" pad={{ vertical: "small" }} onClick={() => history.push("/lysts")}>
        <Logo />
      </Box>
      <Box pad={{ vertical: "small" }} justify="center" width="150px" align="end">
        {account && !account.isAnonymous && (user ? <UserMenu thumb={user.thumb} displayName={user.displayName || user.email} /> : null)}
        {account &&
          account.isAnonymous &&
          (guestProfile ? (
            <UserMenu displayName={`Guest (${guestProfile.displayName})`} />
          ) : (
            <UserMenu accountPhoto={account.photoURL || undefined} displayName={account.displayName || "?"} />
          ))}
        {account === null && <Button onClick={() => history.push("/login")} children={<Text>Login / Register</Text>} />}
      </Box>
    </SContainer>
  );
});

export default TopNavbar;
