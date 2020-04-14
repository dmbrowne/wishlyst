import React, { FC, useState, useEffect } from "react";
import { Select, SelectProps, Box, Text } from "grommet";

type IOption = { id: string; label: string };
type TOption = (IOption & { _new?: false }) | { label: string; _new: true };

interface IProps extends Omit<SelectProps, "options" | "labelKey" | "valueKey" | "value" | "onSearch" | "onChange"> {
  defaultOptions: TOption[];
  createNewOption?: (label: string) => IOption;
  onChange: (option: IOption) => void;
  value: IOption | undefined;
}

const SearchableSelect: FC<IProps> = ({ defaultOptions, createNewOption, onChange, value, ...props }) => {
  const [categories, setCategories] = useState<TOption[]>(defaultOptions);

  useEffect(() => {
    setCategories(defaultOptions);
  }, [defaultOptions]);

  const onSearchCategories = (value: string) => {
    const exactMatch = categories.find(cat => cat.label.toLowerCase() === value.toLowerCase());

    if (!value) {
      return setCategories(defaultOptions);
    }

    return setCategories([
      ...defaultOptions.filter(cat => cat.label.toLowerCase().indexOf(value.toLowerCase()) >= 0),
      ...(!exactMatch && !!createNewOption ? [{ label: value, _new: true }] : ([] as any)),
    ]);
  };

  return (
    <Select
      options={categories}
      labelKey="label"
      valueKey="id"
      value={value}
      onSearch={onSearchCategories}
      children={(option, index, options, { active, disabled, selected }) => (
        <Box hoverIndicator pad="small" {...(selected ? { background: "brand" } : {})}>
          <Text>{option.label}</Text>
          {option._new && <Text size="small" children="(add new category)" />}
        </Box>
      )}
      onChange={({ option }: { option: TOption }) => {
        if (option._new && createNewOption) {
          const newCat = createNewOption(option.label);
          onChange(newCat);
        } else if (option._new) {
          // do nothing
        } else {
          onChange(option);
        }
      }}
      {...props}
    />
  );
};

export default SearchableSelect;
