import React, { useContext, FC } from "react";
import { useHistory, useLocation } from "react-router-dom";
import qs from "query-string";

import { AuthContext } from "../context/auth";
import { useStateSelector } from "../store";

const UserSanityGuard: FC = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const { account, user } = useStateSelector(({ auth }) => auth);

  if (location.pathname.includes("complete-account")) {
    return <>{children}</>;
  }

  if (account && !account.isAnonymous) {
    if (!user) return null;
    if (!user.firstName || !user.lastName) {
      const currentQueryString = qs.parse(window.location.href);
      const queryString = qs.stringify({ ...currentQueryString, redirect: location.pathname });
      history.push("/complete-account?" + queryString);
      return null;
    }
  }

  return <>{children}</>;
};

export default UserSanityGuard;
