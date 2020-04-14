import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";
import { AuthContext } from "../context/auth";

const AuthenticatedRoute: React.FC<RouteProps & { noAnonymous?: boolean }> = ({ noAnonymous, component: C, ...componentProps }) => {
  return (
    <AuthContext.Consumer>
      {({ account }) =>
        account && !account.isAnonymous ? (
          <Route component={C} {...componentProps} />
        ) : account && account.isAnonymous && !noAnonymous ? (
          <Route component={C} {...componentProps} />
        ) : (
          <Route render={props => <Redirect to={`/login?redirect=${props.location.pathname}${props.location.search}`} />} />
        )
      }
    </AuthContext.Consumer>
  );
};

export default AuthenticatedRoute;
