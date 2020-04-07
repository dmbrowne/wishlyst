type TClaimant =
  | {
      userId: string;
      name?: undefined;
      email?: undefined;
    }
  | {
      userId?: undefined;
      name: string;
      email: string;
    };

export interface ILystItem {
  id: string;
  title: string;
  url?: string;
  description?: string;
  thumb?: string;
  claimant?: TClaimant[] | null;
  quantity: number;
  categoryIds?: string[];
}

interface IReducerState {
  allItems: {
    [id: string]: ILystItem;
  };
  order: string[];
  byCategoryId: {
    [categoryId: string]: string[];
  };
}

const initialState: IReducerState = {
  allItems: {},
  order: [],
  byCategoryId: {}
};

export const fetchItemSuccess = (lystItem: ILystItem) => ({
  type: "FETCH_ITEM" as "FETCH_ITEM",
  payload: lystItem
});

export const setOrder = (ids: string[]) => ({
  type: "SET_ORDER" as "SET_ORDER",
  payload: ids
});

type TAction = ReturnType<typeof fetchItemSuccess> | ReturnType<typeof setOrder>;

function LystItemsReducer(state = initialState, action: TAction) {
  switch (action.type) {
    case "FETCH_ITEM":
      return {
        ...state,
        allItems: {
          ...state.allItems,
          [action.payload.id]: action.payload
        }
      };
    case "SET_ORDER":
      return {
        ...state,
        order: action.payload
      };
    default:
      return state;
  }
}

export default LystItemsReducer;
