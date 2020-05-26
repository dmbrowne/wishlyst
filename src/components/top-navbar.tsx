import React, { FC, useContext } from "react";
import { ReactComponent as Logo } from "../assets/icons/wishlystlogo.svg";
import { Box, Text, Button, ResponsiveContext } from "grommet";
import styled from "styled-components";
import { withRouter, Link, useLocation } from "react-router-dom";
import { List, Bookmark, Icon as IconType, UserManager } from "grommet-icons";
import FirebaseImage from "./firebase-image";
import { Avatar } from "./avatar";
import { useStateSelector } from "../store";
import { Icon } from "gestalt";

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
  const location = useLocation();
  const isMobile = useContext(ResponsiveContext) === "small";
  return (
    <Link to={isMobile ? "/app/settings" : "/app/settings/edit-profile"}>
      {location.pathname.startsWith("/app/settings") ? (
        <Icon icon="cog" color="white" size="24px" accessibilityLabel="account settings" />
      ) : thumb ? (
        <FirebaseImage imageRef={thumb}>{imgUrl => <Avatar imgSrc={imgUrl} />}</FirebaseImage>
      ) : (
        <Avatar name={displayName} />
      )}
    </Link>
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
        {navButton("/app/wishlysts", List)}
        {account ? navButton("/app/claimed", Bookmark) : null}
      </Box>

      <Box
        height="100%"
        width={isMobile ? "120px" : "250px"}
        justify="center"
        pad={{ vertical: "small" }}
        onClick={() => history.push("/app/wishlysts")}
      >
        <Logo />
      </Box>
      <Box pad={{ vertical: "small" }} justify="center" width="150px" align="end">
        {account && !account.isAnonymous && (user ? <UserMenu thumb={user.thumb} displayName={user.displayName || user.email} /> : null)}
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
      </Box>
    </SContainer>
  );
});

export default TopNavbar;
