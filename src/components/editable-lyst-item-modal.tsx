import React, { FC, useRef } from "react";
import Modal from "./modal";
import { ILystItem } from "../store/types";
import { storage } from "firebase/app";
import { useStateSelector } from "../store";
import { useFormik } from "formik";
import useEditableLystItem from "../hooks/use-editable-lyst-item";
import EditableLystItemCardContent from "./editable-lyst-item-card-content";

export interface LystItemFormFields {
  name: string;
  url: string;
  description: string;
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
  const lystItem: ILystItem | undefined = useStateSelector(state => state.lystItems.allItems[lystItemId]);
  const { name, url, description, thumb, suggestedNames, suggestedDescription, suggestedImages, quantity } = lystItem || {};

  const formikData = useFormik<LystItemFormFields>({
    initialValues: {
      name: name || "",
      url: url || "",
      description: description || "",
      thumb: thumb || undefined,
      suggestedNames: suggestedNames || null,
      suggestedDescription: suggestedDescription || null,
      suggestedImages: suggestedImages || null,
      quantity: quantity || 1,
    },
    onSubmit: (values: LystItemFormFields) => {
      onSave(values);
      onClose();
    },
  });

  const onUpdateLyst = (lystItem: Partial<ILystItem>) => {
    Object.entries(lystItem).forEach(([key, val]) => formikData.setFieldValue(key, val));
  };

  const editableLystItem = useEditableLystItem({ onUpdateLyst, uploadImgPath });

  const uploadSuccess = (snap: storage.UploadTaskSnapshot) => {
    editableLystItem.onUploadSuccess(snap);
    onSave({ thumb: snap.ref.fullPath });
    onClose();
  };

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
        noGraphData={editableLystItem.noGraphData}
        onAlertDismiss={editableLystItem.resetGraphData}
        onUrlInputBlur={editableLystItem.handleUrlChange}
        onChange={formikData.handleChange}
        setFieldValue={formikData.setFieldValue}
        uploadImgPath={uploadImgPath}
        onUploadSuccess={uploadSuccess}
        onUploadStateChange={editableLystItem.onUploadStateChange}
        onDeleteImageSuccess={() => formikData.setFieldValue("thumb", null)}
        uploadImage={dataUrl => editableLystItem.uploadImage(dataUrl)}
        imgUploadPending={editableLystItem.imgUploadPending}
        values={formikData.values as any}
        onSelectImage={dataUrl => editableLystItem.uploadImage(dataUrl)}
      />
    </Modal>
  );
};

export default EditableLystItemModal;
