import React, { FC } from "react";
import { ILyst } from "../reducers/lyst";
import { Heading, Text } from "grommet";

const ListDetail: FC<{ lyst: ILyst }> = ({ lyst }) => {
  return (
    <>
      <Heading level={1} children={lyst.name} />
      <Text size="large" color="dark-6" children={lyst.description} />
    </>
  );
};

export default ListDetail;
