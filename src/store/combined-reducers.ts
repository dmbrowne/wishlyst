import { combineReducers } from "redux";
import { default as lysts, IReducerState as ILystsState } from "./lysts";
import { default as lystItems, IReducerState as ILystItemsState } from "./lyst-items";

export interface IRootReducer {
  lysts: ILystsState;
  lystItems: ILystItemsState;
}

const reducers = combineReducers({
  lysts,
  lystItems,
});

export default reducers;
