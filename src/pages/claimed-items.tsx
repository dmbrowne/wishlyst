import React, { useContext, useEffect, useState } from "react";
import { Heading, Text } from "grommet";
import { Helmet } from "react-helmet";

import { db } from "../firebase";
import { ILyst, IUser } from "../store/types";
import { GuestProfileContext, IGuestProfile } from "../context/guest-profile";
import { ClaimedLystItemsPreviewList } from "../components/claimed-lyst-items-preview-list";
import { useStateSelector } from "../store";

const ClaimedItems = () => {
  const { guestProfile } = useContext(GuestProfileContext);
  const { account, user } = useStateSelector(({ auth }) => auth);
  const [lystOrder, setLystOrder] = useState<string[]>([]);
  const [lysts, setLysts] = useState<{ [id: string]: ILyst }>({});

  useEffect(() => {
    let useraccount;
    if (account?.isAnonymous && guestProfile) {
      useraccount = guestProfile;
    } else if (!!user) {
      useraccount = user;
    }
    if (useraccount) {
      getLystItemsForUser(useraccount).then(({ order, lysts }) => {
        setLysts(lysts);
        setLystOrder(order);
      });
    }
  }, [user, guestProfile, account]);

  const getLystItemsForUser = (usr: IUser | IGuestProfile) => {
    const lystIds = Object.keys(usr.lystItemsCount || {});
    const lystPromises = lystIds.map(id => {
      return db
        .doc(`lysts/${id}`)
        .get()
        .then(snap => (snap.exists ? { id: snap.id, ...(snap.data() as ILyst) } : null));
    });

    return Promise.all(lystPromises).then(fetchedLysts => {
      const existingLysts = fetchedLysts.reduce(
        (accum, lyst) => (lyst ? { ...accum, [lyst.id]: lyst } : accum),
        {} as { [id: string]: ILyst }
      );
      console.log(fetchedLysts, Object.keys(existingLysts));
      return {
        order: Object.keys(existingLysts),
        lysts: existingLysts,
      };
    });
  };

  return (
    <>
      <Helmet>
        <title>Claimed items and bookmarked lists - Wishlyst</title>
      </Helmet>
      <Heading level={1}>My claimed items</Heading>

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
  );
};

export default ClaimedItems;
