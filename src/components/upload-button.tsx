import React, { FC } from "react";
import { Upload } from "grommet-icons";
import CircleButton, { ICircleButton } from "./circle-button";

interface IUploadButton extends Omit<ICircleButton, "icon"> {}

const UploadButton: FC<IUploadButton> = props => {
  return <CircleButton icon={<Upload />} {...props} />;
};

export default UploadButton;
