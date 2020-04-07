import React, { FC } from "react";
import { ILystItem } from "../reducers/lyst-items";
import { Heading, Box, Text } from "grommet";
import styled from "styled-components";

enum EThumbSize {
  small = "64",
  medium = "128",
  large = "400"
}

const SImage = styled.img`
  object-fit: cover;
  width: 100%;
`;

const getImgThumb = (path: string, size: EThumbSize) => {
  const splitPath = path.split("/");
  const fileNameWithExt = splitPath.pop();
  return `${splitPath.join("/")}/thumb@${size}_${fileNameWithExt}`;
};
interface IProps extends Omit<ILystItem, "id"> {}

export const LystItem: FC<IProps> = ({ thumb, title, quantity }) => {
  return (
    <Box direction="row" gap="small">
      <Box width="64px" height="64px" background="light-3" border>
        {!!thumb && <SImage src={`${getImgThumb(thumb, EThumbSize.small)}`} />}
      </Box>
      <Box justify="between" align="stretch" pad={{ vertical: "xxsmall" }}>
        <Heading margin="none" level={4} children={title} />
        <Text size="small" color="dark-6" children={`Quantity: ${quantity}`} />
      </Box>
    </Box>
  );
};

export default LystItem;
