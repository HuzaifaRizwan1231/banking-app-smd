import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBztJUPn5ZNLw1yXyeVOv8SfOHKXFaA2SE",
  authDomain: "smd-project-b1827.firebaseapp.com",
  projectId: "smd-project-b1827",
  storageBucket: "smd-project-b1827.firebasestorage.app",
  messagingSenderId: "907124283200",
  appId: "1:907124283200:web:0f7efaf1de9455d1768ca5",
  measurementId: "G-JZ4L1C5VPE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics safely (it only works in web environments, not bare React Native)
let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Firebase Authentication and get a reference to the service
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth, app, analytics };
