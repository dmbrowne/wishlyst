import React, { FC, useState, useEffect, useContext } from "react";
import { ReactComponent as Logo } from "../assets/icons/wishlystlogo.svg";
import { Box, Text, Button, DropButton, ThemeContext, ResponsiveContext } from "grommet";
import styled, { useTheme } from "styled-components";
import { auth } from "firebase/app";
import { withRouter, useHistory } from "react-router-dom";
import { List, Bookmark, Icon as IconType, UserManager } from "grommet-icons";
import FirebaseImage from "./firebase-image";
import { Avatar } from "./avatar";
import { useStateSelector } from "../store";

const SContainer = styled(Box).attrs(({ theme }) => ({
  height: "60px",
  pad: { horizontal: "medium" },
  elevation: theme.dark ? "none" : "small",
}))`
  color: #fff;
  background: ${({ theme: { dark } }) =>
    `linear-gradient(90deg,rgba(222, 181, 54,${dark ? "0.6" : "1"}),rgba(227, 193, 95, ${dark ? "0.6" : "1"}))`};
`;

const UserMenu: FC<{ thumb?: string; displayName: string }> = ({ thumb, displayName }) => {
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const { dark } = useTheme();
  const onLogout = () => {
    auth().signOut();
    history.push("/");
    setOpen(false);
  };
  const viewAccount = () => {
    history.push("/my-account");
    setOpen(false);
  };

  return (
    <ThemeContext.Extend value={{ global: { drop: { border: { radius: "12px" } }, extend: "top: 8px" } }}>
      <DropButton
        dropAlign={{ top: "bottom", right: "right" }}
        dropProps={{ elevation: dark ? "none" : "small" }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        dropContent={
          <Box width="200px" style={{ borderRadius: 12 }}>
            <Box pad="small" hoverIndicator onClick={viewAccount} children={<Text>My account</Text>} />
            <Box pad="small" hoverIndicator onClick={onLogout} children={<Text>Logout</Text>} />
          </Box>
        }
      >
        {thumb ? <FirebaseImage imageRef={thumb}>{imgUrl => <Avatar imgSrc={imgUrl} />}</FirebaseImage> : <Avatar name={displayName} />}
      </DropButton>
    </ThemeContext.Extend>
  );
};

const TopNavbar = withRouter(({ history }) => {
  const { account, user } = useStateSelector(({ auth }) => auth);
  const isMobile = useContext(ResponsiveContext) === "small";
  const activeBtnBorder = "rgba(255,255,255,0.6)";
  const activeBtnBg = "rgba(255,255,255,0.3)";

  const navButton = (path: string, Icon: IconType) => {
    const isActive = history.location.pathname === path;
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
        {account ? navButton("/claimed", Bookmark) : null}
      </Box>

      <Box
        height="100%"
        width={isMobile ? "120px" : "250px"}
        justify="center"
        pad={{ vertical: "small" }}
        onClick={() => history.push("/lysts")}
      >
        <Logo />
      </Box>
      <Box pad={{ vertical: "small" }} justify="center" width="150px" align="end">
        {history.location.pathname !== "/my-account" && (
          <>
            {account &&
              !account.isAnonymous &&
              (user ? <UserMenu thumb={user.thumb} displayName={user.displayName || user.email} /> : null)}
            {account && account.isAnonymous && <UserMenu displayName={`${account.displayName || "?"}`} />}
            {account === null &&
              (isMobile ? (
                <Button onClick={() => history.push("/login")} icon={<UserManager color="light-1" />} />
              ) : (
                <Box direction="row" gap="medium">
                  <Button onClick={() => history.push("/login")} children={<Text>Login</Text>} />
                  <Button onClick={() => history.push("/register")} children={<Text>Register</Text>} />
                </Box>
              ))}
          </>
        )}
      </Box>
    </SContainer>
  );
});

export default TopNavbar;
