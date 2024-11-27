// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCocpgn8H-z2GGC_9BkvZSkjjJHR1xUpsw',
  authDomain: 'siren-app-42ecc.firebaseapp.com',
  projectId: 'siren-app-42ecc',
  storageBucket: 'siren-app-42ecc.firebasestorage.app',
  messagingSenderId: '717518823798',
  appId: '1:717518823798:web:aadae26a616c4b37e59a57',
  measurementId: 'G-JZRRF2N90R',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
