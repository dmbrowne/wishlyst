import React, { useContext, FC, useState } from "react";
import { Heading, Button } from "grommet";
import { RouteComponentProps } from "react-router-dom";

import { AuthContext } from "../../context/auth";
import { Helmet } from "react-helmet";
import { useStateSelector } from "../../store";
import FieldInput from "../../components/field-input";

const AnonymousProfileSettings: FC<RouteComponentProps> = ({ history }) => {
  const { forceUpdate } = useContext(AuthContext);
  const { account } = useStateSelector(({ auth }) => auth);
  const [name, setName] = useState(account?.displayName || "");
  const [updating, setUpdating] = useState(false);

  const onSubmit = async () => {
    if (account && account.isAnonymous) {
      setUpdating(true);
      account
        .updateProfile({ displayName: name })
        .then(() => forceUpdate())
        .finally(() => setUpdating(false));
    }
  };

  if (!account) return null;

  return (
    <>
      <Helmet>
        <title>My account - Wishlyst</title>
      </Helmet>
      <Heading margin={{ top: "small", bottom: "large" }} level={2} as="h1" children="My Profile" />
      <FieldInput label="Name" size="small" help="Displayed on claimed items" value={name} onChange={e => setName(e.target.value)} />
      <Button alignSelf="end" label="Change" primary onChange={onSubmit} disabled={!name || updating} />
    </>
  );
};

export default AnonymousProfileSettings;
