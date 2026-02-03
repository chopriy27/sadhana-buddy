import { initializeApp, cert, getApps, type ServiceAccount, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let app: App | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

// Initialize Firebase Admin SDK
function initializeFirebase(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    // Option 1: Use GOOGLE_APPLICATION_CREDENTIALS environment variable
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Initializing Firebase with GOOGLE_APPLICATION_CREDENTIALS');
      return initializeApp();
    }

    // Option 2: Use individual environment variables
    if (process.env.FIREBASE_PROJECT_ID) {
      console.log('Initializing Firebase with individual environment variables');
      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      return initializeApp({
        credential: cert(serviceAccount),
      });
    }

    // Option 3: Use service account JSON directly from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('Initializing Firebase with FIREBASE_SERVICE_ACCOUNT JSON');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return initializeApp({
        credential: cert(serviceAccount),
      });
    }

    console.warn(
      '⚠️  Firebase credentials not found. The app will run with limited functionality.\n' +
      'To enable full functionality, set one of:\n' +
      '  1. GOOGLE_APPLICATION_CREDENTIALS - path to service account JSON file\n' +
      '  2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY\n' +
      '  3. FIREBASE_SERVICE_ACCOUNT - full service account JSON as string\n\n' +
      'Get your Firebase credentials from: https://console.firebase.google.com/\n' +
      '  -> Project Settings -> Service accounts -> Generate new private key'
    );
    return null;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
}

app = initializeFirebase();

// Get Firestore instance (may be null if Firebase is not configured)
function getFirestoreInstance(): Firestore {
  if (!firestoreInstance) {
    if (!app) {
      throw new Error(
        'Firebase is not configured. Please set up Firebase credentials.\n' +
        'See: https://console.firebase.google.com/ -> Project Settings -> Service accounts'
      );
    }
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

// Export a proxy that lazily initializes Firestore
export const firestore = new Proxy({} as Firestore, {
  get(target, prop) {
    const instance = getFirestoreInstance();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

// Get Auth instance (may be null if Firebase is not configured)
function getAuthInstance(): Auth {
  if (!authInstance) {
    if (!app) {
      throw new Error(
        'Firebase is not configured. Please set up Firebase credentials.\n' +
        'See: https://console.firebase.google.com/ -> Project Settings -> Service accounts'
      );
    }
    authInstance = getAuth(app);
  }
  return authInstance;
}

// Export a proxy that lazily initializes Auth
export const firebaseAuth = new Proxy({} as Auth, {
  get(target, prop) {
    const instance = getAuthInstance();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

// Verify Firebase ID token
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await getAuthInstance().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
  return app !== null;
}

// Collection names
export const COLLECTIONS = {
  users: 'users',
  sessions: 'sessions',
  sadhanaEntries: 'sadhana_entries',
  journalEntries: 'journal_entries',
  userProgress: 'user_progress',
  userChallenges: 'user_challenges',
  favoriteSongs: 'favorite_songs',
  userGoals: 'user_goals',
} as const;
