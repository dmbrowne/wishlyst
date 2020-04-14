import React, { FC } from "react";
import { Layer, Box, Heading, Button, BoxTypes } from "grommet";
import { Close } from "grommet-icons";

interface IProps extends BoxTypes {
  title?: string;
  onClose: () => void;
  primaryActions?: Array<{ label: string; onClick: () => void }>;
  secondaryActions?: Array<{ label: string; onClick: () => void }>;
}

const Modal: FC<IProps> = ({ onClose, title, primaryActions, secondaryActions, children, ...props }) => {
  const hasActions = !!primaryActions || !!secondaryActions;
  return (
    <Layer>
      <Box width={{ min: "700px" }} pad="medium" style={{ display: "block" }} {...props}>
        <Box direction="row" justify="between" align="center" margin={{ bottom: "medium" }}>
          {title && <Heading margin="none" level={3} children={title} />}
          <Button icon={<Close />} onClick={onClose} />
        </Box>
        {children}
        {hasActions && (
          <Box direction="row" gap="small" justify="end" margin={{ top: "large", bottom: "small" }}>
            {!!secondaryActions && secondaryActions.map(({ label, onClick }) => <Button label={label} onClick={onClick} />)}
            {!!primaryActions && primaryActions.map(({ label, onClick }) => <Button primary label={label} onClick={onClick} />)}
          </Box>
        )}
      </Box>
    </Layer>
  );
};

export default Modal;
