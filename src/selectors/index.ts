import { IRootReducer } from "./../store/combined-reducers";
import { createSelector } from "reselect";
import { ILyst, ILystItem } from "../store/types";

type TKeyValue<T> = { [id: string]: T };

const getOrder = (state: IRootReducer): string[] | undefined => state.lystItems.orderByLystId[state.lysts.activeView];
const getLystItemMap = (state: IRootReducer) => state.lystItems.allItems;

export const orderedLystItemsSelector = createSelector(getOrder, getLystItemMap, (order, itemMap) => {
  if (order) return order.reduce((accum, id) => [...accum, ...(itemMap[id] ? [itemMap[id]] : ([] as any))], [] as ILystItem[]);
  else return [];
});

export const myLystsSelector = createSelector<IRootReducer, TKeyValue<ILyst>, string[], ILyst[]>(
  state => state.lysts.allLysts,
  state => state.lysts.byMe,
  (lystMap, order) => order.reduce((accum, id) => (lystMap[id] ? [...accum, lystMap[id]] : accum), [] as ILyst[])
);
