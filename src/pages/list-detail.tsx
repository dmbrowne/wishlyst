import React, { FC, useEffect, useReducer, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { firestore } from "firebase/app";
import { db } from "../firebase";
import { useDispatch } from "react-redux";

import componentLystReducer, {
  initialState,
  categoriesFetched,
  setCategoriesOrder,
  categoriesSelector,
  setFilteredCategories,
} from "../component-reducers/lyst";
import ListDetailView from "../components/list-detail-viewer";
import ListDetailEditable from "../components/list-detail-editable";
import { setActiveView, lystAdded } from "../store/lysts";
import { useStateSelector } from "../store";
import { ILyst, ICategory, ILystItem, EFetchStatus } from "../@types";
import { fetchUserSuccess, IStoreUser } from "../store/users";
import CategoriesContextProvider from "../context/categories";
import { Helmet } from "react-helmet";
import LystDetailSidebar from "../components/lyst-detail-sidebar";
import { fetchItemSuccess } from "../component-reducers/lyst-items";
import { removeItem, setOrderForLyst } from "../store/lyst-items";
import { orderedLystItemsSelector } from "../selectors";
import { Box, Heading, Text } from "grommet";

const WishlystExistsGuard: FC<RouteComponentProps<{ id: string }>> = ({ match }) => {
  const lystId = match.params.id;
  const dispatch = useDispatch();
  const { activeView } = useStateSelector(state => state.lysts);
  const wishlyst = useStateSelector(state => state.lysts.allLysts[activeView]) as undefined | ILyst;

  const [lystNotFound, setLystNotFound] = useState(false);

  useEffect(() => {
    const lystRef = db.doc(`lysts/${lystId}`);
    return lystRef.onSnapshot(
      onSnapshot,
      () => setLystNotFound(true),
      () => {}
    );
    function onSnapshot(snap: firestore.DocumentSnapshot) {
      if (snap.exists) dispatch(lystAdded({ id: snap.id, ...(snap.data() as ILyst) }));
      else setLystNotFound(true);
    }
  }, [lystId, dispatch]);

  if (activeView !== lystId) dispatch(setActiveView(lystId));

  if (lystNotFound) {
    return (
      <Box fill align="center" justify="center">
        <Heading level={3}>Ooops, wishlyst not found</Heading>
        <Text>This wishlyst may not be public, or it could have been removed</Text>
      </Box>
    );
  }

  if (activeView !== lystId) return null;
  if (!activeView) return null;
  if (!wishlyst) return null;

  return <ListDetailPage wishlyst={wishlyst} />;
};
const ListDetailPage: FC<{ wishlyst: ILyst }> = ({ wishlyst }) => {
  const lystId = wishlyst.id;
  const dispatch = useDispatch();
  const { account } = useStateSelector(({ auth }) => auth);
  const [componentLystState, localDispatch] = useReducer(componentLystReducer, initialState);
  const isLystOwner = wishlyst && account && wishlyst._private.owner === account.uid;
  const categories = categoriesSelector(componentLystState);
  const [viewFilterMenu, setViewFilterMenu] = useState(false);
  const { filteredCategories } = componentLystState;
  const lystItems = useStateSelector(orderedLystItemsSelector);
  const [fetchStatus, setFetchStatus] = useState(EFetchStatus.initial);
  const hasFetched = fetchStatus !== EFetchStatus.initial && fetchStatus !== EFetchStatus.pending;

  const Component = isLystOwner ? ListDetailEditable : ListDetailView;

  const filterCategory = (categoryId: string) => {
    const cats = [...filteredCategories];
    const existingIdx = filteredCategories.indexOf(categoryId);

    if (existingIdx >= 0) cats.splice(existingIdx, 1);
    else cats.push(categoryId);

    localDispatch(setFilteredCategories(cats));
  };

  useEffect(() => {
    const lystRef = db.doc(`/lysts/${lystId}`);
    // prettier-ignore
    return lystRef.collection(`categories`).orderBy("label", "asc").onSnapshot(snap => {
      const cats = snap.docs.reduce((accum, doc) => ({
        ...accum,
        [doc.id]: { id: doc.id, ...(doc.data() as ICategory) },
      }), {} as { [id: string]: ICategory });

      localDispatch(categoriesFetched(cats));
      localDispatch(setCategoriesOrder(snap.docs.map(({ id }) => id)));
    });
  }, [lystId, dispatch]);

  useEffect(() => {
    const lystRef = db.doc(`/lysts/${lystId}`);
    return lystRef.collection("anonymousUsers").onSnapshot(snap => {
      snap.docChanges().forEach(({ doc }) => {
        dispatch(fetchUserSuccess({ id: doc.id, anonymous: true, ...(doc.data() as IStoreUser) }));
      });
    });
  }, [lystId, dispatch]);

  useEffect(() => {
    const lystItemsRef = db.collection(`lystItems`).where(`wishlystId`, "==", lystId);
    let q: firestore.Query | firestore.CollectionReference = lystItemsRef;

    if (filteredCategories.length) {
      q = q.where("categoryId", "in", filteredCategories);
    }

    return q.orderBy("createdAt", "asc").onSnapshot(onSnapshot);

    function onSnapshot(snapshot: firestore.QuerySnapshot) {
      snapshot.docChanges().forEach(({ type, doc }) => {
        if (type === "added" || type === "modified") dispatch(fetchItemSuccess({ id: doc.id, ...(doc.data() as ILystItem) }));
        if (type === "removed") dispatch(removeItem(doc.id));
      });

      const itemOrder = snapshot.docs.map(doc => doc.id);
      dispatch(setOrderForLyst(lystId, itemOrder));
      setFetchStatus(EFetchStatus.success);
    }
  }, [filteredCategories, lystId, dispatch]);

  return (
    <CategoriesContextProvider
      lystId={lystId}
      categoryMap={componentLystState.categories}
      categories={categories}
      selectedCategories={filteredCategories}
    >
      <>
        <Helmet>
          <title>{wishlyst.name} - Wishlyst</title>
        </Helmet>
        <Component lyst={wishlyst} onFilter={() => setViewFilterMenu(true)} lystItems={lystItems} hasFetched={hasFetched} />
        {viewFilterMenu && (
          <LystDetailSidebar
            lystId={lystId}
            onClose={() => setViewFilterMenu(false)}
            filteredCategories={filteredCategories}
            onSelectCategory={filterCategory}
          />
        )}
      </>
    </CategoriesContextProvider>
  );
};

export default WishlystExistsGuard;
