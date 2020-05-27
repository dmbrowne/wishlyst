import React, { FC } from "react";
import { Box, Text, Button } from "grommet";
import Avatar from "./avatar";
import FirebaseImage from "./firebase-image";
import { ILystItem } from "../@types";
import { Add, Subtract } from "grommet-icons";
import { IconButton } from "gestalt";

interface Props {
  lystItem: ILystItem;
  onDecrement?: (isAnonymous: boolean, userId: string) => void;
  onIncrement?: (isAnonymous: boolean, userId: string) => void;
  onDelete?: (isAnonymous: boolean, userId: string) => void;
  showCount: boolean;
}

const ClaimInfoList: FC<Props> = ({ lystItem, onDecrement, onIncrement, showCount, onDelete }) => {
  const buyers = new Map(Object.entries(lystItem.buyers || {}));

  return (
    <Box>
      {Array.from(buyers.entries()).map(([userId, buyDetails]) => {
        const { displayName, isAnonymous, thumb, count } = buyDetails;
        return (
          <Box key={userId} pad={{ left: "none", vertical: "xxsmall", right: "xxsmall" }} border="between">
            <Box direction="row" gap="small" align="center">
              {thumb ? (
                <FirebaseImage imageRef={thumb} children={imgSrc => <Avatar imgSrc={imgSrc} name={displayName} />} />
              ) : (
                <Avatar name={displayName} />
              )}
              <Box justify="between" align="center" direction="row" style={{ flex: 1 }}>
                <Text children={displayName} as="div" />
                <Box direction="row" gap="small" align="center">
                  {onDecrement && showCount && (
                    <Box round="full" background="black">
                      <Button icon={<Subtract size="small" />} onClick={() => onDecrement(isAnonymous || false, userId)} />
                    </Box>
                  )}
                  {onIncrement && showCount && (
                    <Box round="full" background="black">
                      <Button icon={<Add size="small" />} onClick={() => onIncrement(isAnonymous || false, userId)} />
                    </Box>
                  )}
                  {showCount && <Box pad="small" align="center" width="50px" border children={<Text>{count}</Text>} />}
                  {onDelete && (
                    <IconButton accessibilityLabel="Remove buyer" icon="trash-can" onClick={() => onDelete(isAnonymous || false, userId)} />
                  )}
                  {/* {onDelete && <Button icon={<Trash color="status-critical" />} onClick={() => onDelete(isAnonymous || false, userId)} />} */}
                </Box>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ClaimInfoList;
