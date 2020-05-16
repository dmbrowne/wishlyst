import React, { FC, useContext } from "react";
import { Box, TextInput, ThemeContext, Heading, FormField, TextArea, ResponsiveContext } from "grommet";
import Alert from "./alert";
import SearchableSelect from "./searchable-select";
import ImageSelectionList, { IImageSelectionList } from "./image-selection-list";
import Spinner from "./spinner";
import { ILystItem } from "../store/types";
import { CategoriesContext } from "../context/categories";
import { storage } from "firebase/app";

interface Props extends Omit<IImageSelectionList, "name" | "fetchingUrlImage" | "onDeleteSuccess"> {
  urlGraphFetchPending?: boolean;
  noGraphData?: boolean;
  imgUploadPending?: boolean;
  onAlertDismiss: () => void;
  onUrlInputBlur: (value: string) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFieldValue: (fieldName: string, value: any) => any;
  uploadImgPath: string;
  onDeleteImageSuccess?: (snap: storage.UploadTaskSnapshot) => any;
  uploadImage: (dataUrl: string) => Promise<any>;
  values: Pick<ILystItem, "url" | "name" | "suggestedNames" | "quantity" | "categoryId" | "thumb" | "suggestedImages" | "description">;
}

const EditableLystItemCardContent: FC<Props> = ({
  urlGraphFetchPending,
  noGraphData,
  onAlertDismiss,
  onUrlInputBlur,
  onChange,
  setFieldValue,
  values,
  ...props
}) => {
  const isMobile = useContext(ResponsiveContext) === "small";
  const { categories, categoryMap, createCategory } = useContext(CategoriesContext);

  return (
    <>
      {(urlGraphFetchPending || noGraphData) && (
        <Box margin={{ bottom: "small" }}>
          {urlGraphFetchPending && (
            <Alert size="small" kind="info" icon={<Spinner color="status-info" />} title="Attempting to get information from url..." />
          )}
          {noGraphData && (
            <Alert
              size="small"
              title="Couldn't get info from the url - don't worry you can still enter the details yourself"
              onDismiss={onAlertDismiss}
            />
          )}
        </Box>
      )}
      <Box direction={isMobile ? "column" : "row"} gap="medium" margin={{ bottom: "small" }}>
        <Box gap="xsmall" style={{ flex: 1 }}>
          <TextInput
            name="url"
            size="small"
            placeholder="Link / Url"
            onChange={onChange}
            value={values.url}
            onBlur={e => onUrlInputBlur(e.target.value)}
          />
          <TextInput
            name="name"
            placeholder="Item name"
            value={values.name}
            onChange={onChange}
            {...(values.suggestedNames
              ? {
                  suggestions: values.suggestedNames,
                  onSelect: ({ suggestion }) => setFieldValue("name", suggestion),
                }
              : {})}
          />
          <Box direction="row" gap="small">
            <ThemeContext.Extend value={{ textInput: { container: { extend: "flex: 1" } } }}>
              <TextInput
                size="small"
                name="description"
                onChange={onChange}
                placeholder="Specify a colour if needed"
                value={values.description || ""}
              />
            </ThemeContext.Extend>
            <ThemeContext.Extend value={{ textInput: { container: { extend: "flex: 1" } } }}>
              <TextInput size="small" name="quantity" placeholder="Quantity" type="number" value={values.quantity} onChange={onChange} />
            </ThemeContext.Extend>
            <ThemeContext.Extend value={{ select: { control: { extend: "flex: 1" } } }}>
              <SearchableSelect
                size="small"
                placeholder="Category"
                value={values.categoryId ? categoryMap[values.categoryId] || undefined : undefined}
                onChange={option => setFieldValue("categoryId", option.id)}
                defaultOptions={categories}
                createNewOption={createCategory}
              />
            </ThemeContext.Extend>
          </Box>
        </Box>
      </Box>
      <Heading as="header" level={4} children="Choose an image" margin={{ vertical: "small" }} />
      <ImageSelectionList
        name="lystItemThumb"
        uploadRefPath={props.uploadImgPath}
        onUploadSuccess={props.onUploadSuccess}
        onUploadStateChange={props.onUploadStateChange}
        previewImageRef={values.thumb}
        onDeleteSuccess={props.onDeleteImageSuccess}
        fetchingUrlImage={urlGraphFetchPending}
        uploadPending={props.imgUploadPending}
        imgList={values.suggestedImages}
        onSelectImage={props.onSelectImage}
      />
      {/* <FormField label="Optional text / description" margin={{ vertical: "medium" }}>
        <TextArea
          name="description"
          size="small"
          onChange={onChange}
          placeholder="Describe the colour you want, or what size, or what you plan to use it for etc."
          value={values.description || ""}
        />
      </FormField> */}
    </>
  );
};

export default EditableLystItemCardContent;
