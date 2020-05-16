import React, { FC, useContext } from "react";
import UserRenderer from "./user-renderer";
import { Text, TextProps, ResponsiveContext } from "grommet";

interface Props {
  claimants: string[];
  showAmounts?: boolean;
  textProps?: TextProps;
}

const ClaimInfo: FC<Props> = ({ claimants, showAmounts, textProps }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const claimAmounts = claimants.reduce((accum, userId) => {
    return {
      ...accum,
      [userId]: (accum[userId] || 0) + 1,
    };
  }, {} as { [id: string]: number });

  const renderClaimant = (userId: string, amount: number) => (
    <UserRenderer userId={userId}>
      {user => (
        <Text {...textProps} size={isMobile ? "xsmall" : textProps?.size}>
          {showAmounts ? amount + " from " : ""}
          {user.displayName}
        </Text>
      )}
    </UserRenderer>
  );
  return (
    <>
      {Object.entries(claimAmounts).map(([userId, amount], idx, arr) => {
        const isFirst = idx !== 0;
        const isLast = idx + 1 === arr.length;
        const hasMultipleClaimants = arr.length > 1;
        return (
          <React.Fragment key={userId}>
            {isFirst && !isLast ? ", " : isLast && hasMultipleClaimants ? " and " : ""}
            {renderClaimant(userId, amount)}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default ClaimInfo;
