import { ILystItem } from "../@types";
import { createStore } from "redux";

import reducers, { IRootReducer } from "./combined-reducers";
import { useSelector } from "react-redux";

const store = createStore(reducers, (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__());

export function useStateSelector<TSelected = unknown>(
  selector: (state: IRootReducer) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) {
  return useSelector(selector, equalityFn);
}

export const getAmountClaimed = (buyers: ILystItem["buyers"]) => {
  const amountClaimed = Object.values(buyers || {}).reduce((total, { count }) => total + count, 0);
  return amountClaimed;
};

export default store;
