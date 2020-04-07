import React, { useState, useEffect, FC, useRef } from "react";
import TopNavbar from "../components/top-navbar";
import GridListing from "../styled-components/grid-listing";
import { Box, Button, Text, FormField, TextInput, Heading } from "grommet";
import { firestore, auth } from "firebase";
import { Add } from "grommet-icons";
import Modal from "../components/modal";
import { RouteComponentProps } from "react-router-dom";

const Lists: FC<RouteComponentProps> = ({ history }) => {
  const { current: db } = useRef(firestore());
  const [lysts, setLysts] = useState<{ [key: string]: any }[]>([]);
  const [fetchStatus, setFetchStatus] = useState<"inital" | "success" | "error">("inital");
  const [newLystModal, setNewLystModal] = useState(false);
  const [newLystName, setNewLystName] = useState("");
  const [newLystError, setNewLystError] = useState("");

  useEffect(() => {
    firestore()
      .collection("lysts")
      .get()
      .then(snap => {
        setFetchStatus("success");
        setLysts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
  }, []);

  const onSubmitNewLyst = () => {
    const user = auth().currentUser;

    if (!newLystName) return setNewLystError("Enter a name for the new lyst");
    if (!user) return history.push("/login");

    const newLystRef = db.collection("lysts").doc();
    newLystRef.set({
      name: newLystName,
      createdAt: firestore.Timestamp.now(),
      _private: {
        owner: user.uid
      }
    });
    history.push(`/lysts/${newLystRef.id}`);
  };

  const updateNewLystName = (val: string) => {
    setNewLystError("");
    setNewLystName(val);
  };

  return (
    <>
      <TopNavbar />
      <Box pad="medium">
        <GridListing>
          {lysts &&
            lysts.map(lyst => (
              <Box key={lyst.id} elevation="small" background="white" height="200px" onClick={() => history.push(`/lysts/${lyst.id}`)}>
                <Heading level="4">{lyst.name}</Heading>
              </Box>
            ))}
          <Box align="center" justify="center">
            <Button style={{ textAlign: "center" }} onClick={() => setNewLystModal(true)}>
              <Box pad="small" background="white" elevation="small" style={{ display: "inline-flex", borderRadius: "50%" }}>
                <Add color="accent-1" size="large" />
              </Box>
              <Text style={{ display: "flex" }}>Add new lyst</Text>
            </Button>
          </Box>
        </GridListing>
      </Box>
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
