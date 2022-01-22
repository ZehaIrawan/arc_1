import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

export const app = initializeApp({
  projectId: process.env.REACT_APP_projectId,
  appId: process.env.REACT_APP_appId,
  storageBucket: process.env.REACT_APP_storageBucker,
  apiKey: process.env.REACT_APP_apiKey,
  authDomain: process.env.REACT_APP_authDomain,
  messagingSenderId: process.env.REACT_APP_messagingSenderId,
});

export const storage = getStorage(app);
