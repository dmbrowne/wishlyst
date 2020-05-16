import { IUser } from "./types";

export interface IReducerState {
  account: firebase.User | null;
  user: IUser | null;
  initialFetched: boolean;
}

const initialState: IReducerState = {
  account: null,
  user: null,
  initialFetched: false,
};

export const fetchAccountSuccess = (account: firebase.User | null) => ({
  type: "auth/FETCH_ACCOUNT_SUCCESS" as "auth/FETCH_ACCOUNT_SUCCESS",
  payload: account,
});

export const fetchUserProfileSuccess = (user: IUser | null) => ({
  type: "auth/FETCH_USER_PROFILE_SUCCESS" as "auth/FETCH_USER_PROFILE_SUCCESS",
  payload: user,
});

type Action = ReturnType<typeof fetchAccountSuccess> | ReturnType<typeof fetchUserProfileSuccess>;

export default function accountReducer(state = initialState, action: Action) {
  switch (action.type) {
    case "auth/FETCH_ACCOUNT_SUCCESS":
      return { ...state, account: action.payload, initialFetched: true };
    case "auth/FETCH_USER_PROFILE_SUCCESS":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}
