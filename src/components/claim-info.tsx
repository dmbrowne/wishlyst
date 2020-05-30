import React, { FC, useContext } from "react";
import { Text, TextProps, ResponsiveContext } from "grommet";

interface Props {
  buyerNames: string[];
  textProps?: TextProps;
}

const ClaimInfo: FC<Props> = ({ buyerNames, textProps }) => {
  const isMobile = useContext(ResponsiveContext) === "small";

  return (
    <>
      {buyerNames.map((name, idx, arr) => {
        const isFirst = idx !== 0;
        const isLast = idx + 1 === arr.length;
        const hasMultipleClaimants = arr.length > 1;
        return (
          <React.Fragment key={name}>
            {isFirst && !isLast ? ", " : isLast && hasMultipleClaimants ? " and " : ""}
            <Text {...textProps} size={isMobile ? "xsmall" : textProps?.size}>
              {name}
            </Text>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default ClaimInfo;
