import React, { FC } from "react";
import { ILystItem } from "../store/types";
import { Heading, Box, Text } from "grommet";
import ObjectFitImage from "../styled-components/object-fit-image";
import getImgThumb, { EThumbSize } from "../utils/get-image-thumb";

interface IProps extends Omit<ILystItem, "id"> {}

export const LystItem: FC<IProps> = ({ thumb, name, quantity }) => {
  return (
    <Box direction="row" gap="small">
      <Box width="64px" height="64px" background="light-3" border>
        {!!thumb && <ObjectFitImage src={`${getImgThumb(thumb, EThumbSize.small)}`} />}
      </Box>
      <Box justify="between" align="stretch" pad={{ vertical: "xxsmall" }}>
        <Heading margin="none" level={4} children={name} />
        <Text size="small" color="dark-6" children={`Quantity: ${quantity}`} />
      </Box>
    </Box>
  );
};

export default LystItem;
