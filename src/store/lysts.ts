import { ILyst } from "./types";

export interface IReducerState {
  activeView: string;
  allLysts: {
    [id: string]: ILyst;
  };
  byMe: string[];
  bySubscribed: string[];
}

const initialState: IReducerState = {
  activeView: "",
  allLysts: {},
  byMe: [],
  bySubscribed: [],
};

export const lystAdded = (lyst: ILyst) => ({
  type: "lysts/ADDED" as "lysts/ADDED",
  payload: lyst,
});
export const lystRemoved = (lystId: string) => ({
  type: "lysts/REMOVED" as "lysts/REMOVED",
  payload: lystId,
});
export const setMyLystsOrder = (order: string[]) => ({
  type: "lysts/MY_LYSTS_ORDER" as "lysts/MY_LYSTS_ORDER",
  payload: order,
});
export const subscribedLystsOrder = (order: string[]) => ({
  type: "lysts/SUBSCRIBED_ORDER" as "lysts/SUBSCRIBED_ORDER",
  payload: order,
});
export const setActiveView = (lystId: string) => ({
  type: "lysts/SET_ACTIVE_VIEW" as "lysts/SET_ACTIVE_VIEW",
  payload: lystId,
});

type TAction =
  | ReturnType<typeof lystAdded>
  | ReturnType<typeof setMyLystsOrder>
  | ReturnType<typeof subscribedLystsOrder>
  | ReturnType<typeof setActiveView>
  | ReturnType<typeof lystRemoved>;

export default function reducer(state = initialState, action: TAction) {
  switch (action.type) {
    case "lysts/ADDED":
      return { ...state, allLysts: { ...state.allLysts, [action.payload.id]: action.payload } };
    case "lysts/REMOVED": {
      const lists = { ...state.allLysts };
      delete lists[action.payload];
      return { ...state, allLysts: lists };
    }
    case "lysts/MY_LYSTS_ORDER":
      return { ...state, byMe: action.payload };
    case "lysts/SUBSCRIBED_ORDER":
      return { ...state, bySubscribed: action.payload };
    case "lysts/SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload };
    default:
      return state;
  }
}
