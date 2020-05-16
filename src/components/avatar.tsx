import React, { FC } from "react";
import { Box, Heading } from "grommet";
import styled from "styled-components";

const SAvatarImage = styled.img`
  object-fit: cover;
  border-radius: 50%;
  width: 100%;
  height: 100%;
`;

export const Avatar: FC<
  | {
      name?: string;
      imgSrc: string;
    }
  | {
      name: string;
      imgSrc?: undefined;
    }
> = props => (
  <Box width="40px" height="40px" background="dark-3" style={{ borderRadius: "50%" }} align="center" justify="center">
    {props.imgSrc !== undefined ? (
      <SAvatarImage src={props.imgSrc} />
    ) : (
      <Heading as="span" level={4} children={props.name.charAt(0).toUpperCase()} />
    )}
  </Box>
);

export default Avatar;
