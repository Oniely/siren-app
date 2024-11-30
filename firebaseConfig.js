// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApD58N73DvjXWqNMRyCrmfp3CrioQ2U5o",
  authDomain: "siren-2cc7c.firebaseapp.com",
  databaseURL: "https://siren-2cc7c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "siren-2cc7c",
  storageBucket: "siren-2cc7c.appspot.com",
  messagingSenderId: "715443261009",
  appId: "1:715443261009:web:7dd2d6952d568769daf270",
  measurementId: "G-VNF4P6TET3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getDatabase(app);
export const storage = getStorage(app);

