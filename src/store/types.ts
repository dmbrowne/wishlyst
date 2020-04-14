import { firestore } from "firebase/app";

export enum EFetchStatus {
  initial = "initial",
  pending = "pending",
  success = "success",
  error = "error",
}

export interface ICategory {
  id: string;
  label: string;
}

export interface ILyst {
  id: string;
  name: string;
  thumb?: string;
  description?: string;
  requests?: string[];
  public: boolean;
  createdAt: firestore.Timestamp;
  _private: {
    owner: string;
  };
}

export interface ILystItem {
  id: string;
  name: string;
  url?: string;
  description?: string;
  thumb?: string;
  claimants?: string[];
  quantity: number;
  categoryId?: string;
  createdAt: firestore.Timestamp;
}

export interface IClaimedItem {
  lystItemRef: string; // lystItemRef path
  lystId: string;
  quantity: number;
  claimedAt: firestore.Timestamp;
}

export interface IUser {
  id: string;
  email: string;
  displayName: string;
  thumb?: string;
  bookmarked?: string[];
  lysts?: {
    [lystId: string]: number;
  };
  claimedItems?: {
    [lystItemId: string]: IClaimedItem;
  };
}
