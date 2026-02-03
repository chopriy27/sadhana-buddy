import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth';

// Firebase configuration - these are public keys, safe to expose
const firebaseConfig = {
  apiKey: "AIzaSyDhtYHO8MlVvktrTb0mQzXVZN1LOPcRbKs",
  authDomain: "sadhana-buddy-68fe4.firebaseapp.com",
  projectId: "sadhana-buddy-68fe4",
  storageBucket: "sadhana-buddy-68fe4.firebasestorage.app",
  messagingSenderId: "331106162214",
  appId: "1:331106162214:web:8bbec958f22d32624d78e7",
  measurementId: "G-PZ4B76KGYR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Auth functions
export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    // If popup blocked, try redirect
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
}

export async function signInWithApple() {
  try {
    return await signInWithPopup(auth, appleProvider);
  } catch (error: any) {
    // If popup blocked, try redirect
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, appleProvider);
    }
    throw error;
  }
}

export async function logOut() {
  return signOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

export { onAuthStateChanged, getRedirectResult, type User };
