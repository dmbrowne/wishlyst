import React, { FC, useContext } from "react";
import Modal from "./modal";
import { Text, Box, Heading } from "grommet";
import { AuthContext } from "../context/auth";
import UnauthenticatedClaimModalContent from "./unauthenticated-claim-modal-content";
import AuthenticatedClaimModalContent from "./authenticated-claim-modal-content";
import { ILystItem } from "../store/types";
import { auth } from "firebase";

interface IProps {
  onClose: () => void;
  onClaim: (quantity: number) => void;
  lystItem: ILystItem;
}

export const ClaimItemModal: FC<IProps> = ({ onClose, lystItem, onClaim }) => {
  const { account } = useContext(AuthContext);

  const onAnnoymousLogin = (displayName: string) => {
    auth()
      .signInAnonymously()
      .then(({ user }) => {
        if (user) user.updateProfile({ displayName });
      });
  };

  return (
    <Modal title="Claim Item" onClose={onClose} width="700px">
      <Text as="div">Claim {lystItem.name}?</Text>
      <Text as="div" color="dark-6">
        By claiming this no one else would be able to buy/claim this item
      </Text>

      <Box margin={{ top: "medium" }}>
        {!account ? (
          <UnauthenticatedClaimModalContent
            onAnnoymousLogin={onAnnoymousLogin}
            guestContent={
              <>
                <Heading level={4} margin={{ top: "none" }} children="Claim without account" />
                <Text margin={{ bottom: "small" }}>
                  Without logging in you can't make changes, and you have enter your details each time
                </Text>
              </>
            }
          />
        ) : (
          <AuthenticatedClaimModalContent
            multi={lystItem.quantity > 1}
            onClaim={onClaim}
            totalQuantity={lystItem.quantity}
            maxQuantity={lystItem.quantity - ((lystItem.claimants && lystItem.claimants.length) || 0)}
          />
        )}
      </Box>
    </Modal>
  );
};

export default ClaimItemModal;
