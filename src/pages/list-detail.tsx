import React, { FC, useEffect, useReducer, useRef } from "react";
import { RouteComponentProps } from "react-router-dom";
import { firestore } from "firebase";
import lystReducer, { initialState, lystFetchSuccess, ILyst } from "../reducers/lyst";
import { EFetchStatus } from "../@types";
import Spinner from "../components/spinner";
import ListDetail from "../components/list-detail";

const ListDetailPage: FC<RouteComponentProps<{ id: string }>> = ({ match }) => {
  const { current: db } = useRef(firestore());
  const lystId = match.params.id;
  const [lystState, dispatch] = useReducer(lystReducer, initialState);

  useEffect(() => {
    dispatch({ type: "FETCH" });
    return db.doc(`/lysts/${lystId}`).onSnapshot(snap => {
      dispatch(lystFetchSuccess({ id: snap.id, ...(snap.data() as ILyst) }));
    });
  }, []);

  if (!lystState.lyst) {
    if (lystState.fetchStatus === EFetchStatus.pending) return <Spinner />;
    return <div />;
  }

  return <ListDetail lyst={lystState.lyst} />;
};

export default ListDetailPage;
