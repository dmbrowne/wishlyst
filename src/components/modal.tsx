import React, { FC, useContext } from "react";
import { Layer, Box, Heading, Button, BoxTypes, LayerProps, ResponsiveContext, ButtonType } from "grommet";
import { Close } from "grommet-icons";

interface Action extends ButtonType {
  label: string;
  onClick: () => void;
}
export interface IProps extends BoxTypes {
  title?: string;
  onClose: () => void;
  primaryActions?: Array<Action>;
  secondaryActions?: Array<Action>;
  layerProps?: LayerProps;
}

const Modal: FC<IProps> = ({ onClose, title, primaryActions, secondaryActions, children, layerProps, ...props }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const hasActions = !!primaryActions || !!secondaryActions;

  const mobileStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  return (
    <Layer {...layerProps} responsive={false} modal={false} style={{ maxWidth: 1000, ...(isMobile ? mobileStyle : { width: "80%" }) }}>
      <Box width="100%" pad="medium" {...props} height="100%">
        <Box flex={{ shrink: 0 }} direction="row" justify="between" align="center" margin={{ bottom: "medium" }}>
          {title && <Heading margin="none" level={3} children={title} />}
          <Button icon={<Close />} onClick={onClose} />
        </Box>
        <div style={{ overflow: "auto", flex: 1, paddingTop: 3, paddingBottom: 3 }}>{children}</div>
        {hasActions && (
          <Box flex={{ shrink: 0 }} direction="row" gap="small" justify="between" margin={{ top: "large", bottom: "small" }}>
            <Box direction="row" gap="small">
              {!!secondaryActions && secondaryActions.map(prps => <Button key={prps.label} {...prps} />)}
            </Box>
            <Box direction="row" gap="small">
              {!!primaryActions && primaryActions.map((prps, idx) => <Button primary={idx === 0} key={prps.label} {...prps} />)}
            </Box>
          </Box>
        )}
      </Box>
    </Layer>
  );
};

export default Modal;
