import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";
import { useStateSelector } from "../store";

const AuthenticatedRoute: React.FC<RouteProps & { noAnonymous?: boolean }> = ({ noAnonymous, component: C, ...componentProps }) => {
  const { account, initialFetched } = useStateSelector(state => state.auth);

  if (!initialFetched) return null;

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
