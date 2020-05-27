import { ILystItem, IBuyer } from "../@types";

export interface IReducerState {
  buyers: {
    [id: string]: IBuyer;
  };
  buyersByLystItemId: {
    [id: string]: string[];
  };
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

export const fetchBuyersSuccess = (lystItemId: string, buyers: { [id: string]: IBuyer }) => ({
  type: "lystItems/FETCH_BUYERS_SUCCESS" as "lystItems/FETCH_BUYERS_SUCCESS",
  payload: { lystItemId, buyers },
});

type TAction =
  | ReturnType<typeof fetchItemSuccess>
  | ReturnType<typeof setOrderForLyst>
  | ReturnType<typeof removeItem>
  | ReturnType<typeof setClaimedLystOrder>
  | ReturnType<typeof fetchBuyersSuccess>;

const initialState: IReducerState = {
  buyers: {},
  buyersByLystItemId: {},
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
    case "lystItems/FETCH_BUYERS_SUCCESS":
      return {
        ...state,
        buyers: {
          ...state.buyers,
          ...action.payload.buyers,
        },
        buyersByLystItemId: {
          ...state.buyersByLystItemId,
          [action.payload.lystItemId]: Object.keys(action.payload.buyers),
        },
      };
    default:
      return state;
  }
}

export default LystItemsReducer;
