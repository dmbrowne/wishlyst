import React, { FC, useState, useRef, useEffect } from "react";
import { Box, TextInput, Button, TextArea, FormField, Text } from "grommet";
import * as yup from "yup";
import { firestore, functions, storage } from "firebase/app";
import { debounce } from "throttle-debounce";

import { ILystItem } from "../store/types";
import SearchableSelect from "./searchable-select";
import SRoundedCard from "../styled-components/rounded-card";
import { ICategory } from "../@types";
import ImageUpload from "./image-upload-container";
import SObjectFitImage from "../styled-components/object-fit-image";
import Spinner from "./spinner";
import asyncCatch from "../utils/async-catch";
import useEditableLystItem from "../hooks/use-editable-lyst-item";

interface IProps {
  lystItem: ILystItem;
  uploadImgPath: string;
  categories: ICategory[];
  onUpdateLyst: (field: { [fieldName: string]: any }) => any;
  onDelete: () => void;
  onCreateCategory: (label: string) => { id: string; label: string };
}

const EditableLystItemCard: FC<IProps> = ({ lystItem, categories, onUpdateLyst, uploadImgPath, onCreateCategory, onDelete }) => {
  const {
    noGraphData,
    imgUploadPending,
    urlGraphFetchPending,
    handleUrlChange,
    handleChange,
    onUploadStateChange,
    onUploadSuccess,
  } = useEditableLystItem({ lystItem, onUpdateLyst, uploadImgPath });

  const categoriesMap = categories.reduce(
    (accum, category) => ({
      ...accum,
      [category.id]: category,
    }),
    {} as { [id: string]: ICategory }
  );

  return (
    <SRoundedCard>
      <Box direction="row" gap="medium" margin={{ bottom: "small" }}>
        <Box gap="xsmall" style={{ flex: 1 }}>
          <TextInput name="url" size="small" placeholder="Link / Url" value={lystItem.url} onChange={handleChange(handleUrlChange)} />
          <TextInput
            name="name"
            placeholder="Item name"
            value={lystItem.name}
            onChange={handleChange()}
            icon={urlGraphFetchPending && !lystItem.name ? <Spinner /> : undefined}
          />
          <TextInput
            size="small"
            name="quantity"
            placeholder="Quantity"
            type="number"
            value={lystItem.quantity}
            onChange={handleChange()}
          />
          <SearchableSelect
            size="small"
            placeholder="Category"
            value={lystItem.categoryId ? categoriesMap[lystItem.categoryId] || undefined : undefined}
            onChange={option => onUpdateLyst({ categoryId: option.id })}
            defaultOptions={categories}
            createNewOption={onCreateCategory}
          />
        </Box>
        <Box width="300px" height="195px" justify="center">
          {/* {urlGraphData.image && !lystItem.thumb && <SObjectFitImage src={urlGraphData.image} />} */}
          {imgUploadPending && <Spinner />}
          {!imgUploadPending && (
            <ImageUpload
              name="lystItemThumb"
              uploadRefPath={uploadImgPath}
              onUploadSuccess={onUploadSuccess}
              onUploadStateChange={onUploadStateChange}
              previewImageRef={lystItem.thumb}
              onDeleteSuccess={() => onUpdateLyst({ thumb: null })}
              {...(urlGraphFetchPending ? { children: <Spinner /> } : {})}
            />
          )}
        </Box>
      </Box>
      <FormField label="Optional text / description">
        <TextArea
          name="description"
          size="small"
          onChange={handleChange()}
          placeholder="Describe the colour you want, or what size, or what you plan to use it for etc."
          value={lystItem.description || ""}
        />
      </FormField>
      <Box direction={urlGraphFetchPending || noGraphData ? "row" : "column"} align="center" justify="between">
        {urlGraphFetchPending && (
          <Box direction="row" gap="xsmall" align="center">
            <Spinner />
            <Text size="small">Attempting to get information from url, feel free to enter the details yourself if you're in a hurry!</Text>
          </Box>
        )}
        {noGraphData && (
          <Box align="center">
            <Text size="small">Couldn't grap information from the url, don't worry you can still enter the details yourself</Text>
          </Box>
        )}
        <Button
          color="status-critical"
          primary
          label={<Text size="small" color="light-1" children="DELETE" />}
          margin={{ top: "medium" }}
          alignSelf="end"
          onClick={onDelete}
        />
      </Box>
    </SRoundedCard>
  );
};

export default EditableLystItemCard;
