import React, { useContext, useEffect, useRef, useState } from "react";
import { Heading, Text } from "grommet";
import { firestore } from "firebase/app";

import StandardLayout from "../layouts/standard";
import { AuthContext } from "../context/auth";
import { ILyst, IUser } from "../store/types";
import { GuestProfileContext, IGuestProfile } from "../context/guest-profile";
import { ClaimedLystItemsPreviewList } from "../components/claimed-lyst-items-preview-list";
import { Helmet } from "react-helmet";
import { useStateSelector } from "../store";

const ClaimedItems = () => {
  const { guestProfile } = useContext(GuestProfileContext);
  const { account, user } = useStateSelector(({ auth }) => auth);
  const { current: db } = useRef(firestore());
  const [lystOrder, setLystOrder] = useState<string[]>([]);
  const [lysts, setLysts] = useState<{ [id: string]: ILyst }>({});

  useEffect(() => {
    const lystPromise = !user && guestProfile ? getLystItemsForUser(guestProfile) : !!user ? getLystItemsForUser(user) : undefined;
    if (lystPromise) {
      lystPromise.then(({ order, lysts }) => {
        setLysts(lysts);
        setLystOrder(order);
      });
    }
  }, [user, guestProfile]);

  const getLystItemsForUser = (usr: IUser | IGuestProfile) => {
    const lystIds = Object.keys(usr.lysts || {});
    const lystPromises = lystIds.map(id => {
      return db
        .doc(`lysts/${id}`)
        .get()
        .then(snap => (snap.exists ? { id: snap.id, ...(snap.data() as ILyst) } : null));
    });

    return Promise.all(lystPromises).then(fetchedLystItems => ({
      order: lystIds,
      lysts: fetchedLystItems.reduce((accum, lyst) => (lyst ? { ...accum, [lyst.id]: lyst } : accum), {} as { [id: string]: ILyst }),
    }));
  };

  return (
    <>
      <Helmet>
        <title>Claimed items and bookmarked lists - Wishlyst</title>
      </Helmet>
      <Heading level={1}>My claimed items</Heading>
      {!account ? (
        <Text size="large">Either login or register for an account to start claiming and saving items on your friends wishlysts</Text>
      ) : (
        <>
          <Text>Items that you have chosen to claim</Text>
          {lystOrder.map(lystId => {
            const lyst = lysts[lystId];
            return (
              <div key={lystId}>
                {lyst && <Heading level={3} children={lyst.name} />}
                <ClaimedLystItemsPreviewList
                  lystId={lystId}
                  cardProps={{ width: "25%", margin: { right: "medium" }, style: { minWidth: 350 } }}
                />
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

export default ClaimedItems;
