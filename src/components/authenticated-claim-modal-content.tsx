import React, { useState, FC } from "react";
import { Box, Text, Button } from "grommet";
import Counter from "./counter";

interface IProps {
  multi?: boolean;
  maxQuantity: number;
  totalQuantity: number;
  onClaim: (quantity: number) => void;
}

const AuthenticatedClaimModalContent: FC<IProps> = ({ multi, maxQuantity, totalQuantity, onClaim }) => {
  const [claimAmount, setClaimAmount] = useState(1);
  return (
    <>
      <Box align="center" margin={{ bottom: "medium" }}>
        {multi ? (
          <>
            <Text margin={{ horizontal: "medium" }} textAlign="center">
              Out of {totalQuantity} wanted,{" "}
              {maxQuantity > 1
                ? `there are ${maxQuantity} left to be claimed, how many would you like to get?`
                : "this is the last one available to be claimed"}
            </Text>
            {maxQuantity > 1 && (
              <Box align="center" margin={{ top: "medium" }}>
                <Counter min={1} max={maxQuantity} value={claimAmount} onChange={setClaimAmount} />
              </Box>
            )}
          </>
        ) : (
          <Text margin={{ horizontal: "medium" }} textAlign="center">
            Are you sure you want to claim this item?
          </Text>
        )}
      </Box>
      <Button primary label="Claim" onClick={() => onClaim(claimAmount)} />
    </>
  );
};

export default AuthenticatedClaimModalContent;
