<<<<<<< HEAD
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEsQXShcDO-IP4C0mLFBevckA6ccoFry4",
  authDomain: "workoutplaner-3930e.firebaseapp.com",
  projectId: "workoutplaner-3930e",
  storageBucket: "workoutplaner-3930e.appspot.com",
  messagingSenderId: "197140468893",
  appId: "1:197140468893:web:1e43c4072bddb0a4ec3074",
  measurementId: "G-W85Z68R4B9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
=======
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEsQXShcDO-IP4C0mLFBevckA6ccoFry4",
  authDomain: "workoutplaner-3930e.firebaseapp.com",
  projectId: "workoutplaner-3930e",
  storageBucket: "workoutplaner-3930e.appspot.com",
  messagingSenderId: "197140468893",
  appId: "1:197140468893:web:1e43c4072bddb0a4ec3074",
  measurementId: "G-W85Z68R4B9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
>>>>>>> 97e4f733a0f2380d536ac6a92a2d41bd0a24e640
