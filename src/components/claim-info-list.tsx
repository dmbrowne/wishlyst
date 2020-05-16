import React, { FC } from "react";
import { Box, Text, TextInput, Button } from "grommet";
import UserRenderer from "./user-renderer";
import Avatar from "./avatar";
import FirebaseImage from "./firebase-image";
import { ILystItem } from "../store/types";
import { Add, Subtract, Trash } from "grommet-icons";

interface Props {
  lystItem: ILystItem;
  onDecrement?: (isAnonymous: boolean, userId: string) => void;
  onIncrement?: (isAnonymous: boolean, userId: string) => void;
  onDelete?: (isAnonymous: boolean, userId: string) => void;
  showCount: boolean;
}

const ClaimInfoList: FC<Props> = ({ lystItem, onDecrement, onIncrement, showCount, onDelete }) => {
  const claimants = lystItem.claimants || [];
  const claimAmounts = claimants.reduce((accum, userId) => {
    return {
      ...accum,
      [userId]: (accum[userId] || 0) + 1,
    };
  }, {} as { [id: string]: number });

  const renderClaimant = (userId: string, amount: number) => (
    <UserRenderer userId={userId}>
      {user => (
        <Box direction="row" gap="small" align="center">
          {user.thumb ? (
            <FirebaseImage imageRef={user.thumb} children={imgSrc => <Avatar imgSrc={imgSrc} name={user.displayName} />} />
          ) : (
            <Avatar name={user.displayName} />
          )}
          <Box justify="between" align="center" direction="row" style={{ flex: 1 }}>
            <Text children={user.displayName} as="div" />
            <Box direction="row" gap="small" align="center">
              {onDecrement && showCount && (
                <Box round="full" background="black">
                  <Button icon={<Subtract size="small" />} onClick={() => onDecrement(user.anonymous || false, userId)} />
                </Box>
              )}
              {onIncrement && showCount && (
                <Box round="full" background="black">
                  <Button icon={<Add size="small" />} onClick={() => onIncrement(user.anonymous || false, userId)} />
                </Box>
              )}
              {showCount && <Box pad="small" align="center" width="50px" border children={<Text>{amount}</Text>} />}
              {onDelete && <Button icon={<Trash color="status-critical" />} onClick={() => onDelete(user.anonymous || false, userId)} />}
            </Box>
          </Box>
        </Box>
      )}
    </UserRenderer>
  );

  return (
    <Box>
      {Object.entries(claimAmounts).map(([userId, amount]) => (
        <Box key={userId} pad={{ left: "none", vertical: "xxsmall", right: "xxsmall" }} border="between">
          {renderClaimant(userId, amount)}
        </Box>
      ))}
    </Box>
  );
};

export default ClaimInfoList;
