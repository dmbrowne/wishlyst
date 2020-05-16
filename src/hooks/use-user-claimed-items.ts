import { firestore } from "firebase/app";
import { ILystItem } from "./../store/types";
import { fetchItemSuccess } from "./../store/lyst-items";
import { useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import { AuthContext } from "./../context/auth";
import { useContext } from "react";
import { useStateSelector } from "../store";

const useUserClaimedItems = (lystId: string, categories?: string[]) => {
  const dispatch = useDispatch();
  const { current: db } = useRef(firestore());
  const account = useStateSelector(({ auth }) => auth.account);
  const allLystItems = useStateSelector(state => state.lystItems.allItems);
  const [claimedLystItemsIds, setClaimedLystItemIds] = useState<string[]>([]);
  const [nextQuery, setNextQuery] = useState<null | firestore.Query<firestore.DocumentData>>(null);
  const [hasMore, setHasMore] = useState(true);
  const [unsubscribes, setUnsubscribes] = useState<(() => void)[]>([]);

  useEffect(() => {
    return () => unsubscribes.forEach(stopListening => stopListening());
  }, []);

  useEffect(() => {
    unsubscribes.forEach(stopListening => stopListening());
    start([]);
  }, [categories]);

  // prettier-ignore
  const baseQuery = (accountId: string) => {
    let q = db.collection(`lysts/${lystId}/lystItems`).where("claimants", "array-contains", accountId);
    if (categories && categories.length) {
      q = q.where('categoryId', 'in', categories);
    }
    return q
  }

  const orderedBaseQuery = (accountId: string) => {
    let q = db.collection(`lysts/${lystId}/lystItems`).where("claimants", "array-contains", accountId);

    if (categories && categories.length) {
      q = q.where("categoryId", "in", categories);
    }

    return q.orderBy("createdAt", "desc").limit(10);
  };

  const getLastItem = (accountId: string) => {
    return baseQuery(accountId)
      .orderBy("createdAt", "asc")
      .limit(1)
      .get();
  };

  const doesMoreExist = async (accountId: string, snapDocs: firestore.QueryDocumentSnapshot[]) => {
    const snap = await getLastItem(accountId);
    if (snap.empty) return false;
    const { id: lastDocId } = snap.docs[0];
    const lastDocExistsInSet = snapDocs.findIndex(doc => doc.id === lastDocId) || claimedLystItemsIds.includes(lastDocId);
    return !lastDocExistsInSet;
  };

  const handleDocChanges = ({ type, doc }: firestore.DocumentChange, claimedIds = claimedLystItemsIds) => {
    if (type === "added") {
      if (!claimedIds.includes(doc.id)) return true;
      //setClaimedLystItemIds([...claimedIds, doc.id]);
    }
    if (type === "added" || type === "modified") {
      dispatch(fetchItemSuccess({ id: doc.id, ...(doc.data() as ILystItem) }));
    }
    if (type === "removed") {
      return false;
      // setClaimedLystItemIds(claimedIds.filter(id => id !== doc.id));
    }
  };

  const start = (claimedIds: string[] = claimedLystItemsIds) => {
    if (!account) return;

    const unsubscribe = orderedBaseQuery(account.uid).onSnapshot(async snap => {
      const hasMoreItems = await doesMoreExist(account.uid, snap.docs);

      if (hasMoreItems) {
        const startAfter = [...snap.docs].pop();
        const next = orderedBaseQuery(account.uid).startAfter(startAfter);
        setNextQuery(next);
      } else {
        setNextQuery(null);
      }

      const newIds = snap.docChanges().reduce((accum, { type, doc }) => {
        if (type === "added" || type === "modified") {
          dispatch(fetchItemSuccess({ id: doc.id, ...(doc.data() as ILystItem) }));
        }
        if (type === "added") {
          return !claimedIds.includes(doc.id) ? [...accum, doc.id] : [];
        }
        return accum;
      }, [] as string[]);

      setClaimedLystItemIds([...(claimedIds || []), ...newIds]);
      setHasMore(hasMoreItems);
    });

    setUnsubscribes([...unsubscribes, unsubscribe]);
  };

  const loadMore = () => {
    if (!account) return;

    if (nextQuery) {
      const unsubscribe = nextQuery.onSnapshot(async function(this: { runs: number }, snap) {
        this.runs = this.runs ? this.runs++ : 0;
        const hasMoreItems = await doesMoreExist(account.uid, snap.docs);

        if (this.runs === 0 && hasMoreItems) {
          const startAfter = [...snap.docs].pop();
          const next = orderedBaseQuery(account.uid).startAfter(startAfter);
          setNextQuery(next);
        } else {
          setNextQuery(null);
        }

        snap.docChanges().forEach(({ type, doc }: firestore.DocumentChange) => {
          if (type === "added") {
            if (!claimedLystItemsIds.includes(doc.id)) setClaimedLystItemIds([...claimedLystItemsIds, doc.id]);
          }
          if (type === "added" || type === "modified") dispatch(fetchItemSuccess({ id: doc.id, ...(doc.data() as ILystItem) }));
          if (type === "removed") setClaimedLystItemIds(claimedLystItemsIds.filter(id => id !== doc.id));
        });

        setHasMore(hasMoreItems);
      });

      setUnsubscribes([...unsubscribes, unsubscribe]);
    } else {
      start();
    }
  };

  return {
    start,
    loadMore,
    hasMore,
    items: claimedLystItemsIds.map(id => allLystItems[id]),
  };
};

export default useUserClaimedItems;
