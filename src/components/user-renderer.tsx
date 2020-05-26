import React, { FC, useEffect, ReactNode, ComponentType } from "react";
import { db } from "../firebase";
import { useDispatch, useStore } from "react-redux";

import { useStateSelector } from "../store";
import { fetchUser, fetchUserSuccess, IStoreUser } from "../store/users";
import { IRootReducer } from "../store/combined-reducers";

interface Props {
  userId: string;
  empty?: ComponentType;
  children: (user: IStoreUser) => ReactNode;
}

/**
 * A component that fetches a user from firebase and passes the user to its child using children as a render prop.
 * The redux store is checked for a user with the desired userId first. If it doesnt exist then a single fetch is made to the DB
 *
 */
const UserRenderer: FC<Props> = ({ userId, empty: Empty, children }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const userPending = useStateSelector(state => state.users.pending[userId]);
  const user = useStateSelector(state => state.users.allUsers[userId]);

  useEffect(() => {
    if (user || userPending) return;
    dispatch(fetchUser(userId));
    db.doc(`users/${userId}`)
      .get()
      .then(doc => {
        const empty = doc.exists ? false : true;
        const storeState = store.getState() as IRootReducer;
        const usr = storeState.users.allUsers[userId];

        if (usr && usr.anonymous) return;
        dispatch(fetchUserSuccess({ id: doc.id, empty, ...(doc.data() as IStoreUser) }));
      });
  }, [dispatch, store, user, userId, userPending]);

  if (!user) return null;
  if (userPending) return null;
  if (user && user.empty) return Empty ? <Empty /> : null;

  return <>{children(user)}</>;
};

export default UserRenderer;
