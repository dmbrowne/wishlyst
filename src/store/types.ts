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
  shortUrl?: string;
  createdAt: firestore.Timestamp;
  _private: {
    owner: string;
  };
}

export interface IBuyer {
  displayName: string;
  useDefaultName: boolean;
  count: number;
  isAnonymous: boolean;
  confirmed: boolean;
  userId: string;
  thumb?: string;
}

export interface ILystItem {
  id: string;
  lystId: string;
  name: string;
  suggestedNames?: string[] | null;
  url?: string;
  description?: string;
  color?: string;
  suggestedDescription?: string | null;
  thumb?: string;
  suggestedImages?: (string | firestore.Blob)[] | null;
  buyers?: {
    [userId: string]: IBuyer;
  };
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
  firstName?: string;
  lastName?: string;
  displayName: string;
  thumb?: string;
  bookmarked?: string[];
  lystItemsCount?: {
    [lystId: string]: number;
  };
  claimedItems?: {
    [lystItemId: string]: IClaimedItem;
  };
  pendingClaims?: {
    [lystItemId: string]: IClaimedItem;
  };
  _private: {
    role: "standard" | "admin";
  };
}