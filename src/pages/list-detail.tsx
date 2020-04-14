import React, { FC, useEffect, useReducer, useRef, useContext } from "react";
import { RouteComponentProps } from "react-router-dom";
import { firestore } from "firebase";
import { useDispatch } from "react-redux";

import componentLystReducer, {
  initialState,
  anonymousUsersFetch,
  categoriesFetched,
  setCategoriesOrder,
  categoriesSelector,
} from "../component-reducers/lyst";
import ListDetailView from "../components/list-detail-viewer";
import ListDetailEditable from "../components/list-detail-editable";
import { setActiveView, lystAdded } from "../store/lysts";
import { useStateSelector } from "../store";
import { ILyst, ICategory } from "../store/types";
import { AuthContext } from "../context/auth";

const ListDetailPage: FC<RouteComponentProps<{ id: string }>> = ({ match }) => {
  const { current: db } = useRef(firestore());
  const lystId = match.params.id;
  const dispatch = useDispatch();
  const { account } = useContext(AuthContext);
  const { activeView } = useStateSelector(state => state.lysts);
  const lyst = useStateSelector(state => state.lysts.allLysts[activeView]) as undefined | ILyst;
  const [componentLystState, localDispatch] = useReducer(componentLystReducer, initialState);
  const { current: lystRef } = useRef(db.doc(`/lysts/${lystId}`));
  const isLystOwner = lyst && account && lyst._private.owner === account.uid;
  const categories = categoriesSelector(componentLystState);

  useEffect(() => {
    dispatch(setActiveView(lystId));
  }, []);

  useEffect(() => {
    return lystRef.onSnapshot(snap => dispatch(lystAdded({ id: snap.id, ...(snap.data() as ILyst) })));
  }, [activeView]);

  useEffect(() => {
    return lystRef
      .collection(`categories`)
      .orderBy("label", "asc")
      .onSnapshot(snap => {
        localDispatch(
          categoriesFetched(
            snap.docs.reduce(
              (accum, doc) => ({
                ...accum,
                [doc.id]: { id: doc.id, ...(doc.data() as ICategory) },
              }),
              {}
            )
          )
        );
        localDispatch(setCategoriesOrder(snap.docs.map(({ id }) => id)));
      });
  }, [activeView]);

  useEffect(() => {
    lystRef.collection("anonymousUsers").onSnapshot(snap => {
      const annonUsers = snap.docs.reduce(
        (accum, doc) => ({
          ...accum,
          [doc.id]: doc.data().displayName as string,
        }),
        {} as { [uid: string]: string }
      );
      localDispatch(anonymousUsersFetch(annonUsers));
    });
  }, [activeView]);

  if (!lyst) return null;

  const Component = isLystOwner ? ListDetailEditable : ListDetailView;

  return <Component lyst={lyst} categories={categories} anonymousUsers={componentLystState.anonymousUsers} />;
};

export default ListDetailPage;
