import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAht7ms9CkutAEf9_1WY1a8zZt7vlo5iag",
  authDomain: "gigmaster-d32c0.firebaseapp.com",
  projectId: "gigmaster-d32c0",
  storageBucket: "gigmaster-d32c0.firebasestorage.app",
  messagingSenderId: "1054921966299",
  appId: "1:1054921966299:web:66a04989b97973662dc2fe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
