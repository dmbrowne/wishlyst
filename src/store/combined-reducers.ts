import { default as users, UserReducerState } from "./users";
import { combineReducers } from "redux";
import { default as lysts, IReducerState as ILystsState } from "./lysts";
import { default as lystItems, IReducerState as ILystItemsState } from "./lyst-items";
import { default as auth, IReducerState as IAuthState } from "./account";

export interface IRootReducer {
  lysts: ILystsState;
  lystItems: ILystItemsState;
  users: UserReducerState;
  auth: IAuthState;
}

const reducers = combineReducers({
  lysts,
  lystItems,
  users,
  auth,
});

export default reducers;
