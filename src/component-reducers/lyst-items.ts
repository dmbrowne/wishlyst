import { ILystItem } from "../@types";

export interface IReducerState {
  allItems: {
    [id: string]: ILystItem;
  };
  order: string[];
  byCategoryId: {
    [categoryId: string]: string[];
  };
}

export const initialState: IReducerState = {
  allItems: {},
  order: [],
  byCategoryId: {},
};

export const fetchItemSuccess = (lystItem: ILystItem) => ({
  type: "FETCH_ITEM" as "FETCH_ITEM",
  payload: lystItem,
});

export const removeItem = (lystItemId: string) => ({
  type: "REMOVE_ITEM" as "REMOVE_ITEM",
  payload: lystItemId,
});

export const setOrder = (ids: string[]) => ({
  type: "SET_ORDER" as "SET_ORDER",
  payload: ids,
});

type TAction = ReturnType<typeof fetchItemSuccess> | ReturnType<typeof setOrder> | ReturnType<typeof removeItem>;

function LystItemsReducer(state = initialState, action: TAction) {
  switch (action.type) {
    case "FETCH_ITEM":
      return {
        ...state,
        allItems: {
          ...state.allItems,
          [action.payload.id]: action.payload,
        },
      };
    case "REMOVE_ITEM":
      const allItems = { ...state.allItems };
      delete allItems[action.payload];
      return { ...state, allItems };
    case "SET_ORDER":
      return {
        ...state,
        order: action.payload,
      };
    default:
      return state;
  }
}

export default LystItemsReducer;
