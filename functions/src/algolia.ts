import algoliasearch from "algoliasearch";
import * as functions from "firebase-functions";

const algolia = algoliasearch(functions.config().algolia.appid, functions.config().algolia.adminapikey);

export const lystItemIndex = algolia.initIndex("dev_lystItems");
