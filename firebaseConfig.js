// firebase.ts
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2nXjOqnjzk7J12FBJfdaP-EnODFyz7e4",
  authDomain: "trafficupdates-90fa0.firebaseapp.com",
  projectId: "trafficupdates-90fa0",
  storageBucket: "trafficupdates-90fa0.appspot.com", // ✅ NOTE: use .appspot.com not .app
  messagingSenderId: "936285740352",
  appId: "1:936285740352:android:8b80f44b1cd7aad726aea5",
};

// ✅ Initialize app
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Initialize Firestore
export const db = getFirestore(app);

// ✅ Initialize Storage
export const storage = getStorage(app);
