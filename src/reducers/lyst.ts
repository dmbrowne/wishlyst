import { EFetchStatus } from "./../@types/index";

export interface ILyst {
  id: string;
  name: string;
  thumb?: string;
  description?: string;
  _private: {
    owner: string;
    public: boolean;
  };
}

interface IReducerState {
  fetchStatus: EFetchStatus;
  lyst: ILyst | null;
}

export const initialState: IReducerState = {
  fetchStatus: EFetchStatus.initial,
  lyst: null,
};

export const lystFetch = () => ({
  type: "FETCH" as "FETCH",
});
export const lystFetchSuccess = (lyst: ILyst) => ({
  type: "FETCH_SUCCESS" as "FETCH_SUCCESS",
  payload: lyst,
});

type TAction = ReturnType<typeof lystFetchSuccess> | ReturnType<typeof lystFetch>;

const lystReducer = (state = initialState, action: TAction) => {
  switch (action.type) {
    case "FETCH":
      return {
        ...state,
        fetchStatus: EFetchStatus.pending,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        fetchStatus: EFetchStatus.success,
        lyst: action.payload,
      };
    default:
      return state;
  }
};

export default lystReducer;
