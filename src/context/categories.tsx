import React, { createContext, FC } from "react";
import { ICategory } from "../@types";
import { db } from "../firebase";

interface ICategoryData {
  categoryMap: { [id: string]: ICategory };
  categories: ICategory[];
  selectedCategories: string[];
}
interface ICategoryContext extends ICategoryData {
  createCategory: (label: string) => { id: string; label: string };
}
interface Props extends ICategoryData {
  lystId: string;
}

export const CategoriesContext = createContext<ICategoryContext>({
  categoryMap: {},
  categories: [],
  selectedCategories: [],
  createCategory: () => ({ id: "", label: "" }),
});

const CategoriesContextProvider: FC<Props> = ({ categories, categoryMap, lystId, selectedCategories, children }) => {
  const lystRef = db.doc(`/lysts/${lystId}`);
  const createCategory = (label: string) => {
    const categoryRef = lystRef.collection("categories").doc();
    categoryRef.set({ label });
    return { id: categoryRef.id, label };
  };
  return (
    <CategoriesContext.Provider value={{ categories, categoryMap, createCategory, selectedCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export default CategoriesContextProvider;
