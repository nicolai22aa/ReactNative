import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBEbDwH7Akv0AN2rI3HVNy6DbAhgQduHI0",
  authDomain: "react-aa925.firebaseapp.com",
  projectId: "react-aa925",
  storageBucket: "react-aa925.appspot.com",
  messagingSenderId: "49809274897",
  appId: "1:49809274897:web:0fa5f63a13ec465a2759b0",
  measurementId: "G-GM9NHLW8L8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
