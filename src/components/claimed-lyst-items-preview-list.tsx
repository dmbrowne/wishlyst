import React, { useContext, useEffect, useState, FC } from "react";
import { Heading, Box, BoxTypes } from "grommet";
import { db } from "../firebase";
import { ILystItem } from "../store/types";
import SRoundedCard from "../styled-components/rounded-card";
import FirebaseImage from "./firebase-image";
import getImgThumb, { EThumbSize } from "../utils/get-image-thumb";
import SObjectFitImage from "../styled-components/object-fit-image";
import { GuestProfileContext } from "../context/guest-profile";
import { FabButton } from "../styled-components/fab-button";
import { Next } from "grommet-icons";
import useGuestClaimedItems from "../hooks/use-guest-claimed-items";
import { useStateSelector } from "../store";

interface IProps {
  lystId: string;
  cardProps?: BoxTypes;
}

export const ClaimedLystItemsPreviewList: FC<IProps> = ({ lystId, cardProps }) => {
  const user = useStateSelector(({ auth }) => auth.user);
  const { getLystItemsByLyst } = useGuestClaimedItems();
  const { guestProfile } = useContext(GuestProfileContext);
  const [lystItems, setLystItems] = useState<ILystItem[]>([]);

  useEffect(() => {
    if (user) {
      db.collection(`users/${user.id}/claimedItems`)
        .where("lystId", "==", lystId)
        .limit(5)
        .get()
        .then(snap => {
          setLystItems(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as ILystItem) })));
        });
    } else if (guestProfile) {
      const lystItemIds = (getLystItemsByLyst(lystId) || []).slice(0, 5);
      Promise.all(lystItemIds.map(id => db.doc(`lystItems/${id}`).get())).then(snaps => {
        setLystItems(snaps.map(snap => ({ id: snap.id, ...(snap.data() as ILystItem) })));
      });
    }
  }, [getLystItemsByLyst, guestProfile, lystId, user]);

  return (
    <Box direction="row" gap="medium" wrap={false} overflow="auto">
      {lystItems.map(lystItem => (
        <SRoundedCard key={lystItem.id} width="35vw" style={{ flexShrink: 0 }}>
          <Box>
            <Box style={{ height: "30vw" }}>
              {lystItem.thumb && (
                <FirebaseImage imageRef={getImgThumb(lystItem.thumb, EThumbSize.large)}>
                  {imgUrl => <SObjectFitImage src={imgUrl} />}
                </FirebaseImage>
              )}
            </Box>
            <Heading level={4} children={lystItem.name} margin={{ bottom: "xsmall" }} />
          </Box>
        </SRoundedCard>
      ))}
      <Box width="35vw" style={{ flexShrink: 0 }} align="center" justify="center">
        <FabButton icon={<Next />} label="View all" />
      </Box>
    </Box>
  );
};
