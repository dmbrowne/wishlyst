import { ILystItem } from "./types";

export interface IReducerState {
  allItems: {
    [id: string]: ILystItem;
  };
  orderByLystId: {
    [lystId: string]: string[];
  };
  claimedOrderByLystId: {
    [lystId: string]: string[];
  };
}

export const fetchItemSuccess = (lystItem: ILystItem) => ({
  type: "FETCH_ITEM" as "FETCH_ITEM",
  payload: lystItem,
});

export const removeItem = (lystItemId: string) => ({
  type: "REMOVE_ITEM" as "REMOVE_ITEM",
  payload: lystItemId,
});

export const setOrderForLyst = (lystId: string, ids: string[]) => ({
  type: "SET_ORDER_WITHIN_LYST" as "SET_ORDER_WITHIN_LYST",
  payload: { lystId, ids },
});

export const setClaimedLystOrder = (lystId: string, ids: string[]) => ({
  type: "lystItems/SET_CLAIMED_ORDER" as "lystItems/SET_CLAIMED_ORDER",
  payload: { lystId, ids },
});

type TAction =
  | ReturnType<typeof fetchItemSuccess>
  | ReturnType<typeof setOrderForLyst>
  | ReturnType<typeof removeItem>
  | ReturnType<typeof setClaimedLystOrder>;

const initialState: IReducerState = {
  allItems: {},
  orderByLystId: {},
  claimedOrderByLystId: {},
};

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
    case "SET_ORDER_WITHIN_LYST":
      return {
        ...state,
        orderByLystId: {
          ...state.orderByLystId,
          [action.payload.lystId]: action.payload.ids,
        },
      };
    case "lystItems/SET_CLAIMED_ORDER":
      return {
        ...state,
        claimedOrderByLystId: {
          ...state.claimedOrderByLystId,
          [action.payload.lystId]: action.payload.ids,
        },
      };
    default:
      return state;
  }
}

export default LystItemsReducer;
