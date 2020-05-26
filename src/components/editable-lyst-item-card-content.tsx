import React, { FC, useContext } from "react";
import { Box, Heading, TextArea, ResponsiveContext } from "grommet";
import SearchableSelect from "./searchable-select";
import ImageSelectionList, { IImageSelectionList } from "./image-selection-list";
import { ILystItem } from "../store/types";
import { CategoriesContext } from "../context/categories";
import FieldInput from "./field-input";
import FieldInputLabel from "./field-input-label";

interface Props extends Omit<IImageSelectionList, "name" | "fetchingUrlImage" | "onDeleteSuccess"> {
  urlGraphFetchPending?: boolean;
  imgUploadPending?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFieldValue: (fieldName: string, value: any) => any;
  uploadImgPath: string;
  onDeleteImageSuccess: () => any;
  values: Pick<
    ILystItem,
    "url" | "name" | "suggestedNames" | "quantity" | "categoryId" | "thumb" | "suggestedImages" | "description" | "color"
  >;
}

const EditableLystItemCardContent: FC<Props> = ({ urlGraphFetchPending, onChange, setFieldValue, values, ...props }) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const { categories, categoryMap, createCategory } = useContext(CategoriesContext);
  const textRowCount = (values.description || "").split("\n").length;
  const rows = textRowCount + 1;

  return (
    <>
      <Box direction={isMobile ? "column" : "row"} gap="medium" margin={{ bottom: "small" }}>
        <Box gap="xsmall" style={{ flex: 1 }}>
          <FieldInput name="url" size="small" label="Link / Url" onChange={onChange} value={values.url} />
          <FieldInput
            name="name"
            label="Item name"
            asterisk={true}
            value={values.name}
            onChange={onChange}
            suggestions={values.suggestedNames ? values.suggestedNames : undefined}
            onSelect={values.suggestedNames ? ({ suggestion }) => setFieldValue("name", suggestion) : undefined}
          />
          <Box direction="row" gap="small">
            <FieldInput size="small" name="color" onChange={onChange} label="Colour" value={values.color || ""} />
            <Box style={{ flex: 0.5 }}>
              <FieldInput size="small" name="quantity" label="Quantity" type="number" value={values.quantity} onChange={onChange} />
            </Box>
            <Box style={{ flex: 1.2 }}>
              <Box margin={{ left: "xsmall", bottom: "xsmall" }}>
                <FieldInputLabel size="small">Category</FieldInputLabel>
              </Box>
              <SearchableSelect
                size="small"
                placeholder="Category"
                value={values.categoryId ? categoryMap[values.categoryId] || undefined : undefined}
                onChange={option => setFieldValue("categoryId", option.id)}
                defaultOptions={categories}
                createNewOption={createCategory}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <Heading as="header" level={5} children="Choose an image" margin={{ top: "large", bottom: "small" }} />
      <ImageSelectionList
        name="lystItemThumb"
        uploadRefPath={props.uploadImgPath}
        previewImageRef={values.thumb}
        onDeleteImageSuccess={props.onDeleteImageSuccess}
        fetchingUrlImage={urlGraphFetchPending}
        uploadPending={props.imgUploadPending}
        imgList={values.suggestedImages}
        onSelectImage={props.onSelectImage}
      />
      <Box margin={{ vertical: "medium" }}>
        <Box margin={{ left: "xsmall", bottom: "xsmall" }}>
          <FieldInputLabel>Description</FieldInputLabel>
        </Box>
        <TextArea
          style={{ height: "unset" }}
          rows={rows}
          name="description"
          size="small"
          onChange={onChange}
          placeholder="Describe the colour you want, size, or what you plan to use it for etc."
          value={values.description || ""}
        />
      </Box>
    </>
  );
};

export default EditableLystItemCardContent;
