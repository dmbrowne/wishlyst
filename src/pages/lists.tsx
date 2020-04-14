import React, { useState, useEffect, FC, useRef, useContext } from "react";
import TopNavbar from "../components/top-navbar";
import GridListing from "../styled-components/grid-listing";
import { Box, Text, FormField, TextInput, Heading, Button } from "grommet";
import { firestore, auth } from "firebase";
import { Add } from "grommet-icons";
import Modal from "../components/modal";
import { RouteComponentProps } from "react-router-dom";
import StandardLayout from "../layouts/standard";
import SRoundedCard from "../styled-components/rounded-card";
import { FabButton } from "../styled-components/fab-button";
import { useStateSelector } from "../store";
import { myLystsSelector } from "../selectors";
import { useDispatch } from "react-redux";
import { lystAdded, setMyLystsOrder } from "../store/lysts";
import { ILyst } from "../store/types";
import { AuthContext } from "../context/auth";

const Lists: FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const { current: db } = useRef(firestore());
  const { account } = useContext(AuthContext);
  const lysts = useStateSelector(myLystsSelector);
  const [newLystModal, setNewLystModal] = useState(false);
  const [newLystName, setNewLystName] = useState("");
  const [newLystError, setNewLystError] = useState("");

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

  return (
    <StandardLayout>
      <Heading level={1} children="My Wishlysts" />

      {!account || account.isAnonymous ? (
        <Text size="large">You need to sign up for an account or login if you want to start creating wishlysts</Text>
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
    </StandardLayout>
  );
};

export default Lists;
