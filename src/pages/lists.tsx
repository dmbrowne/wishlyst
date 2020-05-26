import React, { useState, useEffect, FC, useContext } from "react";
import GridListing from "../styled-components/grid-listing";
import { Box, Text, Heading, Button, ThemeContext, ResponsiveContext } from "grommet";
import { firestore, auth } from "firebase/app";
import { RouteComponentProps } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import { Add, StatusWarning } from "grommet-icons";
import { db } from "../firebase";

import Modal from "../components/modal";
import SRoundedCard from "../styled-components/rounded-card";
import { FabButton } from "../styled-components/fab-button";
import { useStateSelector } from "../store";
import { myLystsSelector } from "../selectors";
import { lystAdded, setMyLystsOrder } from "../store/lysts";
import { ILyst } from "../store/types";
import { ReactComponent as ListIcon } from "../assets/icons/list.svg";
import FirebaseImage from "../components/firebase-image";
import SObjectFitImage from "../styled-components/object-fit-image";
import FieldInput from "../components/field-input";

const Lists: FC<RouteComponentProps> = ({ history }) => {
  const dispatch = useDispatch();
  const isMobile = useContext(ResponsiveContext) === "small";
  const { account, initialFetched } = useStateSelector(({ auth }) => auth);
  const lysts = useStateSelector(myLystsSelector);
  const [newLystModal, setNewLystModal] = useState(false);
  const [newLystName, setNewLystName] = useState("");
  const [, setNewLystError] = useState("");

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
  }, [account, dispatch]);

  const onSubmitNewLyst = () => {
    const user = auth().currentUser;

    if (!newLystName) return setNewLystError("Enter a name for the new lyst");
    if (!user) return history.push("/login");

    const newLystRef = db.collection("lysts").doc();
    const newLyst: Omit<ILyst, "id"> = {
      name: newLystName,
      public: false,
      createdAt: firestore.Timestamp.now(),
      _private: {
        owner: user.uid,
      },
    };
    newLystRef.set(newLyst);
    history.push(`/app/wishlysts/${newLystRef.id}`);
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
              <SRoundedCard
                key={lyst.id}
                height={{ min: isMobile ? "150px" : "250px" }}
                pad="none"
                onClick={() => history.push(`/app/wishlysts/${lyst.id}`)}
                overflow="hidden"
              >
                <Box height={isMobile ? "80px" : "150px"}>
                  {lyst.thumb ? (
                    <FirebaseImage imageRef={lyst.thumb}>{imgSrc => <SObjectFitImage src={imgSrc} />}</FirebaseImage>
                  ) : (
                    <Box pad="12px" background="dark-2" children={<ListIcon />} />
                  )}
                </Box>
                <Box pad="medium">
                  <Heading level="4" margin={{ top: "none" }} children={lyst.name} />
                </Box>
              </SRoundedCard>
            ))}
          <Box align="center" justify="center" height={isMobile ? "150px" : "250px"}>
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
          <FieldInput label="wishlyst name" value={newLystName} onChange={e => updateNewLystName(e.target.value)} />
        </Modal>
      )}
    </>
  );
};

export default Lists;
