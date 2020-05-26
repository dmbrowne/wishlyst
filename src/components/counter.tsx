import React, { FC } from "react";
import { Box, TextInput, Button } from "grommet";
import { Add, Subtract } from "grommet-icons";

interface IProps {
  max: number;
  min: number;
  value: number;
  onChange: (val: number) => any;
}

const ControlBtn: FC<{ onClick: () => void; icon: React.ReactElement }> = ({ onClick, icon }) => (
  <Button primary style={{ borderRadius: "50%", width: 48, height: 48 }} icon={icon} onClick={onClick} />
);

const Counter: FC<IProps> = ({ max, min, value, onChange }) => {
  const validatedValue = (val: number) => (val > max ? max : val < min ? min : val);
  const increment = () => onChange(validatedValue(value + 1));
  const decrement = () => onChange(validatedValue(value - 1));

  return (
    <Box align="center" direction="row" gap="medium">
      <ControlBtn icon={<Add />} onClick={increment} />
      <Box alignSelf="center">
        <TextInput
          style={{ textAlign: "center", fontSize: 40, padding: 12 }}
          size="large"
          value={validatedValue(value)}
          type="number"
          step="1"
          max={max}
          min={min}
          onChange={e => onChange(parseInt(e.target.value, 10))}
        />
      </Box>
      <ControlBtn icon={<Subtract />} onClick={decrement} />
    </Box>
  );
};

export default Counter;
