import React, { useState } from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";
import { AuthContext } from "../context/auth";
import { auth } from "firebase/app";

const AuthenticatedRoute: React.FC<RouteProps & { noAnonymous?: boolean }> = ({ noAnonymous, component: C, ...componentProps }) => {
  const [account, setAccount] = useState();
  const [initalFetched, setInitialFetched] = useState(false);

  auth().onAuthStateChanged(userAccount => {
    setAccount(userAccount);
    setInitialFetched(true);
  });

  if (!initalFetched) return null;

  return (
    <>
      {account && !account.isAnonymous ? (
        <Route component={C} {...componentProps} />
      ) : account && account.isAnonymous && !noAnonymous ? (
        <Route component={C} {...componentProps} />
      ) : (
        <Route render={props => <Redirect to={`/login?redirect=${props.location.pathname}${props.location.search}`} />} />
      )}
    </>
  );
};

export default AuthenticatedRoute;
