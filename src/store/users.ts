import { IUser } from "./types";

export interface IStoreUser extends Omit<IUser, "email"> {
  empty?: boolean;
  email?: string;
  anonymous?: boolean;
}

interface KeyValueInterface<T> {
  [id: string]: T;
}

export interface UserReducerState {
  allUsers: KeyValueInterface<IStoreUser>;
  pending: { [userId: string]: boolean };
}

const initialState: UserReducerState = {
  allUsers: {},
  pending: {},
};

export const fetchUser = (userId: string) => ({
  type: "users/FETCH" as "users/FETCH",
  payload: userId,
});

export const fetchUserSuccess = (user: IStoreUser) => ({
  type: "users/FETCH_SUCCESS" as "users/FETCH_SUCCESS",
  payload: user,
});

export const removeUserSuccess = (userId: string) => ({
  type: "users/REMOVE_SUCCESS" as "users/REMOVE_SUCCESS",
  payload: userId,
});

type Actions = ReturnType<typeof fetchUserSuccess> | ReturnType<typeof removeUserSuccess> | ReturnType<typeof fetchUser>;

export function userReducer(state = initialState, action: Actions) {
  switch (action.type) {
    case "users/FETCH":
      return { ...state, pending: { ...state.pending, [action.payload]: true } };
    case "users/FETCH_SUCCESS":
      return {
        ...state,
        allUsers: {
          ...state.allUsers,
          [action.payload.id]: action.payload,
        },
        pending: {
          ...state.pending,
          [action.payload.id]: false,
        },
      };
    case "users/REMOVE_SUCCESS":
      return {
        ...state,
        allUsers: {
          ...state.allUsers,
          [action.payload]: {
            ...state.allUsers[action.payload],
            empty: true,
          },
        },
      };
    default:
      return state;
  }
}

export default userReducer;
