import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId
  );
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID.'
    );
  }
  if (!app) {
    app = initializeApp({
      apiKey: firebaseConfig.apiKey!,
      authDomain: firebaseConfig.authDomain!,
      projectId: firebaseConfig.projectId!,
      ...(firebaseConfig.appId ? { appId: firebaseConfig.appId } : {}),
    });
    auth = getAuth(app);
  }
  return auth!;
}
