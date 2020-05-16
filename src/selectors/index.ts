import { IRootReducer } from "./../store/combined-reducers";
import { createSelector } from "reselect";
import { ILyst, ILystItem } from "../store/types";

type TKeyValue<T> = { [id: string]: T };

const getOrder = (state: IRootReducer): string[] | undefined => state.lystItems.orderByLystId[state.lysts.activeView];
const getLystItemMap = (state: IRootReducer) => state.lystItems.allItems;
const getclaimFilter = (state: IRootReducer) => state.lysts.claimFilter;
const getAccountId = (state: IRootReducer) => state.auth.account?.uid;

export const orderedLystItemsSelector = createSelector(
  getAccountId,
  getOrder,
  getclaimFilter,
  getLystItemMap,
  (accountId, order, claimFilter, itemMap) => {
    if (order) {
      return order.reduce((accum, id) => {
        const item = itemMap[id];
        const exists = !!item;
        const claimantsCount = item.claimants?.length || 0;
        const claimants = item.claimants || [];
        let add = false;

        if (exists) {
          if (!claimFilter) add = true;
          if (claimFilter === "claimed" && claimantsCount > 0) add = true;
          if (claimFilter === "me" && !!accountId && claimants.includes(accountId)) add = true;
          if (claimFilter === "unclaimed" && claimantsCount === 0) add = true;
        }

        return [...accum, ...(add ? [item] : ([] as any))];
      }, [] as ILystItem[]);
    } else return [];
  }
);

export const myLystsSelector = createSelector<IRootReducer, TKeyValue<ILyst>, string[], ILyst[]>(
  state => state.lysts.allLysts,
  state => state.lysts.byMe,
  (lystMap, order) => order.reduce((accum, id) => (lystMap[id] ? [...accum, lystMap[id]] : accum), [] as ILyst[])
);
