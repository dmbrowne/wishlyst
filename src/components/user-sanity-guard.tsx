import React, { FC } from "react";
import { useHistory, useLocation } from "react-router-dom";
import qs from "query-string";

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
      const currentQueryString = qs.parse(location.search);
      const queryString = qs.stringify({ ...currentQueryString, redirect: location.pathname });
      history.push("/complete-account?" + queryString);
      return null;
    }
  }

  return <>{children}</>;
};

export default UserSanityGuard;