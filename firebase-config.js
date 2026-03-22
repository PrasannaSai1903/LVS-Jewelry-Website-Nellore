// Import the Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";
// Firebase Auth imports for popup sign‑in
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// TODO: Replace this with your actual Firebase Configuration object
// You can get this by creating a Web App inside your Firebase Project console (firebase.google.com)
const firebaseConfig = {
  apiKey: "AIzaSyDRlFu4RxtRFTKw2DssRJHqHrnRw_jbbkQ",
  authDomain: "lvs-jewelry.firebaseapp.com",
  projectId: "lvs-jewelry",
  storageBucket: "lvs-jewelry.appspot.com", // Tried legacy appspot for better compatibility
  messagingSenderId: "294866494671",
  appId: "1:294866494671:web:a3afd5828888c254aec3ba",
  measurementId: "G-XW6ZT5XQMP"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database (connect to named database "lvsjewelrydb")
const db = getFirestore(app, "lvsjewelrydb");

// Initialize Firebase Storage
const storage = getStorage(app);
// Initialize Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export db, storage, and auth utilities
export {
  db,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
};
