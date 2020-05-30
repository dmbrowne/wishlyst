import React, { FC, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import qs from "query-string";

import { useStateSelector } from "../store";

const UserSanityGuard: FC = ({ children }) => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const { account, user, initialFetched, userFetched } = useStateSelector(({ auth }) => auth);
  const notAnonymous = account && !account.isAnonymous;
  const hasRequiredDetails = notAnonymous && user && user.firstName && user.lastName;

  useEffect(() => {
    if (account && !account.isAnonymous) {
      if (user) {
        if (!user.firstName || !user.lastName) {
          const currentQueryString = qs.parse(search);
          const queryString = qs.stringify({ ...currentQueryString, redirect: pathname });
          history.push("/complete-account?" + queryString);
        }
      }
    }
  }, [user, account, history, pathname, search]);

  if (!initialFetched) return null;
  if (initialFetched && !userFetched) return null;
  if (!hasRequiredDetails) return null;

  return <>{children}</>;
};

export default UserSanityGuard;
