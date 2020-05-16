import React, { useState, useEffect, FC, useRef, useContext } from "react";
import GridListing from "../styled-components/grid-listing";
import { Box, Text, FormField, TextInput, Heading, Button, ThemeContext } from "grommet";
import { firestore, auth } from "firebase/app";
import { Add, StatusWarning } from "grommet-icons";
import Modal from "../components/modal";
import { RouteComponentProps } from "react-router-dom";
import SRoundedCard from "../styled-components/rounded-card";
import { FabButton } from "../styled-components/fab-button";
import { useStateSelector } from "../store";
import { myLystsSelector } from "../selectors";
import { useDispatch } from "react-redux";
import { lystAdded, setMyLystsOrder } from "../store/lysts";
import { ILyst } from "../store/types";
import { useTheme } from "styled-components";
import { Helmet } from "react-helmet";

const Lists: FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const { current: db } = useRef(firestore());
  const { account, initialFetched } = useStateSelector(({ auth }) => auth);
  const lysts = useStateSelector(myLystsSelector);
  const [newLystModal, setNewLystModal] = useState(false);
  const [newLystName, setNewLystName] = useState("");
  const [newLystError, setNewLystError] = useState("");
  const { dark } = useTheme();

  useEffect(() => {
    if (!account) return;
    db.collection("lysts")
      .where("_private.owner", "==", account.uid)
      .get()
      .then(snap => {
        snap.docChanges().forEach(({ doc, type }) => {
          if (type === "added") dispatch(lystAdded({ id: doc.id, ...(doc.data() as ILyst) }));
        });
        dispatch(setMyLystsOrder(snap.docs.map(({ id }) => id)));
      });
  }, [account]);

  const onSubmitNewLyst = () => {
    const user = auth().currentUser;

    if (!newLystName) return setNewLystError("Enter a name for the new lyst");
    if (!user) return history.push("/login");

    const newLystRef = db.collection("lysts").doc();
    const newLyst: Omit<ILyst, "id"> = {
      name: newLystName,
      public: true,
      createdAt: firestore.Timestamp.now(),
      _private: {
        owner: user.uid,
      },
    };
    newLystRef.set(newLyst);
    history.push(`/lysts/${newLystRef.id}`);
  };

  const updateNewLystName = (val: string) => {
    setNewLystError("");
    setNewLystName(val);
  };

  if (!initialFetched) return null;

  return (
    <>
      <Helmet>
        <title>My wishlysts - Wishlyst</title>
      </Helmet>
      <Heading
        level={1}
        margin={{ horizontal: "auto" }}
        children="My Wishlysts"
        textAlign={!account || account.isAnonymous ? "center" : "start"}
      />

      {!account || account.isAnonymous ? (
        <Box margin={{ top: "10vh" }}>
          <Box style={{ opacity: 0.7 }} align="center" gap="small">
            <StatusWarning size="128px" />
            <Text size="large" textAlign="center">
              You need to sign up for an account or login to create and edit wishlysts
            </Text>
          </Box>
          <ThemeContext.Extend
            value={{
              global: {
                colors: { text: { light: "#f6f6f6" } },
                hover: { color: { light: "#fff" } },
              },
              button: {
                padding: {
                  vertical: "12px",
                  horizontal: "48px",
                },
              },
            }}
          >
            <Button
              margin={{ top: "medium" }}
              alignSelf="center"
              color="brand"
              onClick={() => history.push("/login")}
              primary
              label="Register / Login"
            />
          </ThemeContext.Extend>
        </Box>
      ) : (
        <GridListing>
          {lysts &&
            lysts.map(lyst => (
              <SRoundedCard key={lyst.id} height="200px" onClick={() => history.push(`/lysts/${lyst.id}`)}>
                <Heading level="4">{lyst.name}</Heading>
              </SRoundedCard>
            ))}
          <Box align="center" justify="center">
            <FabButton label="Add new lyst" icon={<Add size="large" />} onClick={() => setNewLystModal(true)} />
          </Box>
        </GridListing>
      )}

      {newLystModal && (
        <Modal
          title="Create a new wishlyst"
          onClose={() => setNewLystModal(false)}
          primaryActions={[{ label: "Add", onClick: onSubmitNewLyst }]}
        >
          <FormField label="wishlyst name">
            <TextInput value={newLystName} onChange={e => updateNewLystName(e.target.value)} />
          </FormField>
        </Modal>
      )}
    </>
  );
};

export default Lists;
