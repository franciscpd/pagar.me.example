import firebase from "firebase/app";
import { firebase as firebaseConfig } from "config";

import "firebase/firestore";
import "firebase/auth";

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

export { db, auth };
