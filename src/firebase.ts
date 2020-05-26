import firebaseApp from "firebase/app";
import "firebase/firestore";
import "firebase/functions";
import "firebase/auth";
import "firebase/storage";

firebaseApp.initializeApp({
  apiKey: "AIzaSyCz2_qBGGYAlsIt07wkm4WSN62XtDCCgf0",
  authDomain: "gift-wishlyst.firebaseapp.com",
  databaseURL: "https://gift-wishlyst.firebaseio.com",
  projectId: "gift-wishlyst",
  storageBucket: "gift-wishlyst.appspot.com",
  messagingSenderId: "440381086817",
  appId: "1:440381086817:web:d7e6a6a9187cfc6efb9e20",
});

export const db = firebaseApp.firestore();

// if (process.env.NODE_ENV !== "production") {
//   db.settings({
//     host: `${window.location.hostname}:7000`,
//     ssl: false,
//   });
//   firebaseApp.functions().useFunctionsEmulator(`http://${window.location.hostname}:5001`);
// }
