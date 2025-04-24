import { initializeApp, getApps } from 'firebase/app';
     import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
     import { getFirestore } from 'firebase/firestore';
     import AsyncStorage from '@react-native-async-storage/async-storage';
     import Constants from 'expo-constants';

     const firebaseConfig = {
       apiKey: Constants.expoConfig.extra.firebaseApiKey,
       authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
       projectId: Constants.expoConfig.extra.firebaseProjectId,
       storageBucket: Constants.expoConfig.extra.firebaseStorageBucket,
       messagingSenderId: Constants.expoConfig.extra.firebaseMessagingSenderId,
       appId: Constants.expoConfig.extra.firebaseAppId,
       measurementId: Constants.expoConfig.extra.firebaseMeasurementId,
     };

     // Prevent re-initialization
     let app;
     if (getApps().length === 0) {
       app = initializeApp(firebaseConfig);
     } else {
       app = getApps()[0];
     }

     // Initialize Auth with AsyncStorage persistence
     const auth = initializeAuth(app, {
       persistence: getReactNativePersistence(AsyncStorage),
     });

     const db = getFirestore(app);

     export { auth, db };