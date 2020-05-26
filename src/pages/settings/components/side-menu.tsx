import React, { FC, useContext } from "react";
import { Box, Button, Text, ResponsiveContext } from "grommet";
import { Icon, IconProps } from "gestalt";
import { Logout, IconProps as GrommetIconProps, LinkPrevious } from "grommet-icons";
import { RouteComponentProps } from "react-router-dom";
import { useStateSelector } from "../../../store";

export const SideMenu: FC<RouteComponentProps> = ({ history }) => {
  const { account } = useStateSelector(state => state.auth);
  const isMobile = useContext(ResponsiveContext) === "small";
  const registedRoutes = [
    { label: "My account", href: "/app/settings/my-account", icon: (iconProps: IconProps) => <Icon icon="person" {...iconProps} /> },
    {
      label: "logout",
      href: "/app/settings/logout",
      icon: (iconProps: GrommetIconProps & JSX.IntrinsicElements["svg"]) => <Logout {...iconProps} />,
    },
  ];
  const menuItems = [
    { label: "Edit profile", href: "/app/settings/edit-profile", icon: (iconProps: IconProps) => <Icon icon="edit" {...iconProps} /> },
    ...(account ? (account.isAnonymous ? [] : registedRoutes) : []),
  ];
  const MobileArrowContainer: FC = prps => (
    <Box width="100%">
      <Box onClick={() => history.push("/app/wishlysts")}>
        <Box pad="medium" direction="row" gap="small">
          <LinkPrevious />
          <Text>My wishlysts</Text>
        </Box>
      </Box>
      {prps.children}
    </Box>
  );
  const menu = (
    <Box width={isMobile ? "80%" : "200px"} margin={isMobile ? "auto" : undefined}>
      {menuItems.map(({ icon: MenuIcon, ...menuItem }) => (
        <Button key={menuItem.label} hoverIndicator="white" onClick={() => history.push(menuItem.href)} margin={{ right: "small" }}>
          <Box direction="row" pad="small" margin={isMobile ? "medium" : "none"} align="center" gap="small">
            {MenuIcon ? <MenuIcon accessibilityLabel={menuItem.label} /> : null}
            <Text {...(isMobile ? { size: "large" } : {})}>{menuItem.label}</Text>
          </Box>
        </Button>
      ))}
    </Box>
  );
  return <>{isMobile ? <MobileArrowContainer children={menu} /> : menu}</>;
};
