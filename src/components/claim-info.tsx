import React, { FC, useContext } from "react";
import { Text, TextProps, ResponsiveContext } from "grommet";
import { IBuyer } from "../@types";

interface Props {
  buyers: { [id: string]: IBuyer };
  showAmounts?: boolean;
  textProps?: TextProps;
}

const ClaimInfo: FC<Props> = ({ buyers, showAmounts, textProps }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const buyersMap = new Map(Object.entries(buyers || {}));

  return (
    <>
      {Array.from(buyersMap.entries()).map(([userId, buyDetails], idx, arr) => {
        const isFirst = idx !== 0;
        const isLast = idx + 1 === arr.length;
        const hasMultipleClaimants = arr.length > 1;
        const { displayName, count } = buyDetails;
        return (
          <React.Fragment key={userId}>
            {isFirst && !isLast ? ", " : isLast && hasMultipleClaimants ? " and " : ""}
            <Text {...textProps} size={isMobile ? "xsmall" : textProps?.size}>
              {showAmounts ? count + " from " : ""}
              {displayName}
            </Text>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default ClaimInfo;
