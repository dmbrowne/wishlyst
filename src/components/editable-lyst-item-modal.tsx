import React, { FC } from "react";
import Modal from "./modal";
import { ILystItem } from "../store/types";
import { useStateSelector } from "../store";
import { useFormik } from "formik";
import useEditableLystItem from "../hooks/use-editable-lyst-item";
import EditableLystItemCardContent from "./editable-lyst-item-card-content";

export interface LystItemFormFields {
  name: string;
  url: string;
  description?: string;
  color?: string;
  categoryId?: string;
  thumb?: string | null;
  suggestedNames?: string[] | null;
  suggestedDescription?: string | null;
  suggestedImages?: ILystItem["suggestedImages"];
  quantity: number;
}

interface Props {
  lystItemId: string;
  uploadImgPath: string;
  onSave: (values: Partial<LystItemFormFields>) => any;
  onClose: () => void;
  onDelete?: () => void;
}

const EditableLystItemModal: FC<Props> = ({ lystItemId, uploadImgPath, onSave, onClose, onDelete }) => {
  const lystItem = (useStateSelector(state => state.lystItems.allItems[lystItemId]) as ILystItem | undefined) || ({} as Partial<ILystItem>);
  const formikData = useFormik<LystItemFormFields>({
    initialValues: {
      name: lystItem.name || "",
      url: lystItem.url || "",
      thumb: lystItem.thumb,
      categoryId: lystItem.categoryId || "",
      color: lystItem.color || "",
      description: lystItem.description || "",
      suggestedNames: lystItem.suggestedNames || null,
      suggestedDescription: lystItem.suggestedDescription || null,
      suggestedImages: lystItem.suggestedImages || null,
      quantity: lystItem.quantity || 1,
    },
    onSubmit: (values: LystItemFormFields) => {
      onSave(values);
      onClose();
    },
  });

  const onUpdateLystItem = (lystItem: Partial<LystItemFormFields>) => {
    Object.entries(lystItem).forEach(([key, val]) => formikData.setFieldValue(key, val));
  };

  const editableLystItem = useEditableLystItem({ values: formikData.values, onUpdateLystItem, uploadImgPath });

  const deleteConfirm = () => {
    if (!onDelete) return;
    const confirm = window.confirm("Are you sure you want to this item?");
    if (confirm) {
      onDelete();
    }
  };

  return (
    <Modal
      title={!!lystItem ? "Edit lyst item" : "Add new lyst item"}
      onClose={onClose}
      primaryActions={[{ label: "Save", onClick: formikData.handleSubmit }]}
      secondaryActions={!!lystItem && onDelete ? [{ label: "Delete", onClick: deleteConfirm, color: "status-error" }] : undefined}
    >
      <EditableLystItemCardContent
        uploadRefPath={uploadImgPath}
        urlGraphFetchPending={editableLystItem.urlGraphFetchPending}
        onChange={formikData.handleChange}
        setFieldValue={formikData.setFieldValue}
        uploadImgPath={uploadImgPath}
        onDeleteImageSuccess={() => formikData.setFieldValue("thumb", null)}
        imgUploadPending={editableLystItem.imgUploadPending}
        values={formikData.values as any}
        onSelectImage={dataUrl => editableLystItem.uploadImage(dataUrl)}
      />
    </Modal>
  );
};

export default EditableLystItemModal;
