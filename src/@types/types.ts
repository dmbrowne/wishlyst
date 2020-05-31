import { firestore } from "firebase/app";

export enum EFetchStatus {
  initial = "initial",
  pending = "pending",
  success = "success",
  error = "error",
}

interface IImageDefinition {
  storageRef: string;
  downloadUrl: string;
}
export interface ICategory {
  id: string;
  label: string;
}

export interface ILyst {
  id: string;
  name: string;
  image?: Pick<IImageDefinition, "downloadUrl"> & { isCustomImage: boolean; storageRef?: string };
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
  thumbnailUrl?: string;
}

export interface IAlgoliaLystItem {
  id: string;
  wishlystId: string;
  name: string;
  color?: string;
  thumbnailUrl?: string;
  categoryId?: string;
  buyerUserIds: string[];
  claimed: boolean;
}

export interface ILystItem {
  id: string;
  wishlystId: string;
  name: string;
  url?: string;
  description?: string;
  color?: string;
  image?: IImageDefinition;
  quantity: number;
  categoryId?: string;
  suggestedNames?: string[] | null;
  suggestedImages?: (string | firestore.Blob)[] | null;
  buyerIds?: string[];
  buyerDisplayNames?: string[];
  totalClaimed: number;
  createdAt: firestore.Timestamp;
}

export interface ILystItemFormFields
  extends Pick<
    ILystItem,
    "name" | "url" | "description" | "image" | "color" | "quantity" | "categoryId" | "suggestedNames" | "suggestedImages"
  > {}

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
  image?: Pick<IImageDefinition, "downloadUrl"> & { storageRef?: string };
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
