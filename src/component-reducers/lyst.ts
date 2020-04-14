import { createSelector } from "reselect";
import { ICategory } from "./../store/types";

interface IReducerState {
  categoriesOrder: string[];
  categories: { [id: string]: ICategory };
  anonymousUsers: {
    [uid: string]: string; //displayName
  };
}

export const initialState: IReducerState = {
  categoriesOrder: [],
  categories: {},
  anonymousUsers: {},
};

export const anonymousUsersFetch = (users: { [uid: string]: string }) => ({
  type: "FETCHED_ANONYMOUS_USERS" as "FETCHED_ANONYMOUS_USERS",
  payload: users,
});

export const categoriesFetched = (categories: { [id: string]: ICategory }) => ({
  type: "FETCHED_CATEGORIES" as "FETCHED_CATEGORIES",
  payload: categories,
});

export const setCategoriesOrder = (order: string[]) => ({
  type: "SET_CATEGORIES_ORDER" as "SET_CATEGORIES_ORDER",
  payload: order,
});

export const categoriesSelector = createSelector<IReducerState, { [id: string]: ICategory }, string[], ICategory[]>(
  state => state.categories,
  state => state.categoriesOrder,
  (categoriesMap, order) => {
    return order.reduce((accum, id) => (categoriesMap[id] ? [...accum, categoriesMap[id]] : accum), [] as ICategory[]);
  }
);

type TAction = ReturnType<typeof anonymousUsersFetch> | ReturnType<typeof categoriesFetched> | ReturnType<typeof setCategoriesOrder>;

const lystReducer = (state = initialState, action: TAction) => {
  switch (action.type) {
    case "SET_CATEGORIES_ORDER":
      return { ...state, categoriesOrder: action.payload };
    case "FETCHED_CATEGORIES":
      return { ...state, categories: action.payload };
    case "FETCHED_ANONYMOUS_USERS":
      return { ...state, anonymousUsers: action.payload };
    default:
      return state;
  }
};

export default lystReducer;
