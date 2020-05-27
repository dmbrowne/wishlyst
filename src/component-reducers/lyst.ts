import { createSelector } from "reselect";
import { ICategory } from "../@types";

interface IReducerState {
  categoriesOrder: string[];
  categories: { [id: string]: ICategory };
  filteredCategories: string[];
}

export const initialState: IReducerState = {
  categoriesOrder: [],
  filteredCategories: [],
  categories: {},
};

export const categoriesFetched = (categories: { [id: string]: ICategory }) => ({
  type: "FETCHED_CATEGORIES" as "FETCHED_CATEGORIES",
  payload: categories,
});

export const setCategoriesOrder = (order: string[]) => ({
  type: "SET_CATEGORIES_ORDER" as "SET_CATEGORIES_ORDER",
  payload: order,
});

export const setFilteredCategories = (cats: string[]) => ({
  type: "SET_FILTERED_CATEGORIES" as "SET_FILTERED_CATEGORIES",
  payload: cats,
});

export const categoriesSelector = createSelector<IReducerState, { [id: string]: ICategory }, string[], ICategory[]>(
  state => state.categories,
  state => state.categoriesOrder,
  (categoriesMap, order) => {
    return order.reduce((accum, id) => (categoriesMap[id] ? [...accum, categoriesMap[id]] : accum), [] as ICategory[]);
  }
);

type TAction = ReturnType<typeof categoriesFetched> | ReturnType<typeof setCategoriesOrder> | ReturnType<typeof setFilteredCategories>;

const lystReducer = (state = initialState, action: TAction) => {
  switch (action.type) {
    case "SET_CATEGORIES_ORDER":
      return { ...state, categoriesOrder: action.payload };
    case "FETCHED_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_FILTERED_CATEGORIES":
      return { ...state, filteredCategories: action.payload };
    default:
      return state;
  }
};

export default lystReducer;
