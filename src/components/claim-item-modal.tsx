import React, { FC } from "react";
import { Text, Box, Heading } from "grommet";
import qs from "query-string";
import { useLocation } from "react-router-dom";
import Modal from "./modal";
import UnauthenticatedClaimModalContent from "./unauthenticated-claim-modal-content";
import AuthenticatedClaimModalContent from "./authenticated-claim-modal-content";
import { ILystItem } from "../store/types";
import { useStateSelector, getAmountClaimed } from "../store";
import useLystItemActions from "../hooks/use-lyst-item-actions";

interface IProps {
  onClose: () => void;
  lystItem: ILystItem;
}

export const ClaimItemModal: FC<IProps> = ({ onClose, lystItem }) => {
  const account = useStateSelector(({ auth }) => auth.account);
  const location = useLocation();
  const currentQueryString = qs.parse(location.search);
  const queryString = qs.stringify({ ...currentQueryString, redirect: location.pathname, claim: lystItem.id });
  const amountClaimed = getAmountClaimed(lystItem.buyers);
  const { claim } = useLystItemActions(lystItem.lystId, lystItem.id);

  return (
    <Modal title="Claim Item" onClose={onClose}>
      <Text as="div">Claim {lystItem.name}?</Text>
      <Text as="div" color="dark-6">
        By claiming this no one else would be able to buy/claim this item
      </Text>

      <Box margin={{ top: "medium" }}>
        {!account ? (
          <UnauthenticatedClaimModalContent
            redirectQueryString={queryString}
            onAnonymousSignInSuccess={lystItem.quantity === 1 ? onClose : undefined}
            guestContent={<Heading level={4} margin={{ top: "none" }} children="Claim without account" />}
          />
        ) : (
          <AuthenticatedClaimModalContent
            multi={lystItem.quantity > 1}
            onClaim={claim}
            totalQuantity={lystItem.quantity}
            maxQuantity={lystItem.quantity - amountClaimed}
          />
        )}
      </Box>
    </Modal>
  );
};

export default ClaimItemModal;
