import React, { FC, useContext } from "react";
import { Box, ResponsiveContext } from "grommet";
import { LinkPrevious } from "grommet-icons";
import { useLocation, Link, RouteComponentProps } from "react-router-dom";
import { useStateSelector } from "../../store";
import Alert from "../../components/alert";
import Account from "./account";
import ProfileSettings from "./full-profile";
import AnonymousProfileSetting from "./anonymous-profile";
import AuthenticatedRoute from "../../components/authenticated-route";
import { SideMenu } from "./components/side-menu";
import Logout from "./logout";

const Settings: FC<RouteComponentProps> = ({ match, history }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const location = useLocation();
  const isExactSettingUrl = location.pathname === "/app/settings" || location.pathname === "/app/settings/";
  const { account } = useStateSelector(state => state.auth);

  if (!account) {
    return null;
  }

  const ProfileComponent = account.isAnonymous ? AnonymousProfileSetting : ProfileSettings;

  return (
    <Box width={{ max: "1024px" }} direction="row" style={{ margin: "auto", width: "100%" }}>
      <AuthenticatedRoute path={match.url + "/"} {...(isMobile ? { exact: true } : {})} component={SideMenu} />

      {isExactSettingUrl && isMobile ? null : (
        <Box style={{ flex: 1 }}>
          {account?.isAnonymous && (
            <Alert margin={{ top: "small" }} kind="warning" title="Not signed in" onClick={() => history.push("/upgrade-account")}>
              You're using a partial account, register to convert to a full account
            </Alert>
          )}
          {isMobile ? (
            <Box alignSelf="start" margin={{ top: "small", bottom: "medium" }}>
              <Link to="/app/settings" children={<LinkPrevious />} />
            </Box>
          ) : null}
          <AuthenticatedRoute path={match.url + "/edit-profile"} component={ProfileComponent} />
          <AuthenticatedRoute path={match.url + "/my-account"} component={Account} />
          <AuthenticatedRoute path={match.url + "/logout"} component={Logout} />
        </Box>
      )}
    </Box>
  );
};

export default Settings;
