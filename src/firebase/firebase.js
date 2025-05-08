// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAz4CXUzAXNviBH-zc3fIbwOmRRCGcpSuU',
  authDomain: 'lead-tracker-94cf0.firebaseapp.com',
  projectId: 'lead-tracker-94cf0',
  storageBucket: 'lead-tracker-94cf0.firebasestorage.app',
  messagingSenderId: '483726863363',
  appId: '1:483726863363:web:3fada964511aca3c5bf236',
  measurementId: 'G-86K81TJG2K',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);
