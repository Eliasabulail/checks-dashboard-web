import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config or inject via app.json extra and Constants.manifest
export const firebaseConfig = {
  apiKey: 'AIzaSyDbwprepwmUyMh9PrVc3mbcEXeD47MBqvc',
  authDomain: 'checks-dashboard.firebaseapp.com',
  projectId: 'checks-dashboard',
  storageBucket: 'checks-dashboard.firebasestorage.app',
  messagingSenderId: '128693774437',
  appId: '1:128693774437:web:b68e7a4ed2a5d103f27e8c',
  measurementId: "G-NSB370DGJY"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
