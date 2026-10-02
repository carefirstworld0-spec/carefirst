import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

export const firebaseConfig = {
    apiKey: "AIzaSyA_5zy_N1AIHrGM-6yAmxlt5pXK1HNKAdo",
    authDomain: "carefirst-47dde.firebaseapp.com",
    projectId: "carefirst-47dde",
    storageBucket: "carefirst-47dde.firebasestorage.app",
    messagingSenderId: "764566301102",
    appId: "1:764566301102:web:f7c824060e00e18715803f",
    measurementId: "G-CW4NXQCQJL",
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
