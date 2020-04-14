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
      <Box align="center">
        <Text margin={{ horizontal: "medium" }} textAlign="center">
          Out of the {totalQuantity} wanted,
        </Text>
        {multi && (
          <>
            <Text margin={{ horizontal: "medium", bottom: "medium" }} textAlign="center">
              {maxQuantity > 1
                ? `there are ${maxQuantity} left to be claimed, how many would you like to get?`
                : "this is the last one available to be claimed"}
            </Text>
            <Box align="center" margin={{ bottom: "large" }}>
              {maxQuantity > 1 && <Counter min={1} max={maxQuantity} value={claimAmount} onChange={setClaimAmount} />}
            </Box>
          </>
        )}
      </Box>
      <Button primary label="Claim" onClick={() => onClaim(claimAmount)} />
    </>
  );
};

export default AuthenticatedClaimModalContent;
