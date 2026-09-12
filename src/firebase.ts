import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDw4Bm-T2wVRoyBET9JABczBAtWIEBtk2w",
  authDomain: "lost-and-found-app-a2f5b.firebaseapp.com",
  projectId: "lost-and-found-app-a2f5b",
  storageBucket: "lost-and-found-app-a2f5b.firebasestorage.app",
  messagingSenderId: "523069363157",
  appId: "1:523069363157:web:613b49f0ad034051f0635c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);