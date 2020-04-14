import React from "react";
import { action } from "@storybook/addon-actions";
import { ClaimItemModal } from "./claim-item-modal";
import { ILystItem } from "../store/types";

export default {
  title: "Components|Claim Item Modal",
  component: ClaimItemModal,
};

export const SingleItem = () => (
  <ClaimItemModal
    onClaim={action("onClaim")}
    lystItem={{ name: "Babyzen YOYO stroller", quantity: 1, id: "43r34" } as ILystItem}
    onClose={action("onClose")}
  />
);
export const MultipleItem = () => (
  <ClaimItemModal
    onClaim={action("onClaim")}
    lystItem={{ name: "Babyzen YOYO stroller", quantity: 1, id: "43r34" } as ILystItem}
    onClose={action("onClose")}
  />
);
