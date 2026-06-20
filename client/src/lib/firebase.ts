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
  signInWithCredential,
  type User
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlFsIv8oTWHSejyBT9V9uAtDUXtO0D1lU",
  authDomain: "sadhana-buddy-68fe4.firebaseapp.com",
  projectId: "sadhana-buddy-68fe4",
  storageBucket: "sadhana-buddy-68fe4.firebasestorage.app",
  messagingSenderId: "331106162214",
  appId: "1:331106162214:web:8bbec958f22d32624d78e7",
  measurementId: "G-PZ4B76KGYR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

const WEB_CLIENT_ID = "331106162214-j343vn5s3jkuj8mugmfdopkd3svqpkkf.apps.googleusercontent.com";

export async function signInWithGoogle() {
  if (Capacitor.isNativePlatform()) {
    try {
      // @ts-ignore
      const { SocialLogin } = await import('@capgo/capacitor-social-login');

      // Initialize if needed (can be called multiple times safely usually, but better once)
      await SocialLogin.initialize({
        google: {
          webClientId: WEB_CLIENT_ID,
        },
      });

      const result = await SocialLogin.login({
        provider: 'google',
        options: {
          scopes: ['email', 'profile'],
        },
      });

      const googleResult = result.result;
      const idToken = 'idToken' in googleResult ? googleResult.idToken : null;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        return await signInWithCredential(auth, credential);
      } else {
        throw new Error("No ID Token returned from Google Sign-In");
      }
    } catch (error: any) {
      console.error("Native Google Sign-In failed:", error);
      throw error;
    }
  }

  // Web Fallback
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
}

export async function logOut() {
  if (Capacitor.isNativePlatform()) {
    try {
      // @ts-ignore
      const { SocialLogin } = await import('@capgo/capacitor-social-login');
      await SocialLogin.logout({ provider: 'google' });
    } catch (e) {}
  }
  return signOut(auth);
}

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

export async function signInWithApple() {
  try {
    return await signInWithPopup(auth, appleProvider);
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, appleProvider);
    }
    throw error;
  }
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
