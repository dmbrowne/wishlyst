import React, { FC } from "react";
import Modal from "./modal";
import useEditableLystItem from "../hooks/use-editable-lyst-item";
import { ILystItem, ICategory } from "../store/types";
import Spinner from "./spinner";
import { Box, TextInput } from "grommet";
import ImageUpload from "./image-upload-container";
import SearchableSelect from "./searchable-select";

interface Props {
  lystItem: ILystItem;
  uploadImgPath: string;
  onUpdateLyst: (field: { [fieldName: string]: any }) => any;
  onClose: () => void;
  categories: ICategory[];
  onCreateCategory: (label: string) => { id: string; label: string };
}

const EditableLystItemModalContent: FC<Props> = ({ lystItem, onUpdateLyst, uploadImgPath, onClose, categories, onCreateCategory }) => {
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
    <>
      <Box gap="xsmall" style={{ flex: 1 }}>
        <TextInput name="url" size="small" placeholder="Link / Url" value={lystItem.url} onChange={handleChange(handleUrlChange)} />
        <TextInput
          name="name"
          placeholder="Item name"
          value={lystItem.name}
          onChange={handleChange()}
          icon={urlGraphFetchPending && !lystItem.name ? <Spinner /> : undefined}
        />
      </Box>
      <Box width="300px" height="300px" justify="center" margin={{ vertical: "small" }}>
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
      <Box gap="xsmall" style={{ flex: 1 }}>
        <TextInput size="small" name="quantity" placeholder="Quantity" type="number" value={lystItem.quantity} onChange={handleChange()} />
        <SearchableSelect
          size="small"
          placeholder="Category"
          value={lystItem.categoryId ? categoriesMap[lystItem.categoryId] || undefined : undefined}
          onChange={option => onUpdateLyst({ categoryId: option.id })}
          defaultOptions={categories}
          createNewOption={onCreateCategory}
        />
      </Box>
    </>
  );
};

export default EditableLystItemModalContent;
