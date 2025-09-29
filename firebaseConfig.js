// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2nXjOqnjzk7J12FBJfdaP-EnODFyz7e4",
  authDomain: "trafficupdates-90fa0.firebaseapp.com",
  projectId: "trafficupdates-90fa0",
  storageBucket: "trafficupdates-90fa0.firebasestorage.app", 
  messagingSenderId: "936285740352",
  appId: "1:936285740352:android:8b80f44b1cd7aad726aea5",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Export the app instance
export default app;

// Helper function to get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Helper function to wait for auth state to be ready
export const waitForAuth = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Check if user is authenticated
export const isUserAuthenticated = () => {
  return auth.currentUser !== null;
};