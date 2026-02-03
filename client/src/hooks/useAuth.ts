import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmail, 
  signUpWithEmail,
  signInWithGoogle,
  signInWithApple,
  logOut,
  resetPassword,
  getIdToken,
  type User as FirebaseUser
} from '@/lib/firebase';
import { apiRequest } from '@/lib/queryClient';
import { API_BASE_URL } from '@/lib/config';

export interface AppUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  displayName: string | null;
  timezone?: string;
}

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Sync Firebase user with backend
  const syncUserWithBackend = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const token = await fbUser.getIdToken();
      
      // Split display name into first and last name
      const displayName = fbUser.displayName || '';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Sync user with backend
      const response = await fetch(`${API_BASE_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: fbUser.uid,
          email: fbUser.email,
          firstName,
          lastName,
          profileImageUrl: fbUser.photoURL,
          displayName: fbUser.displayName,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: fbUser.uid,
          email: fbUser.email,
          firstName: userData.firstName || firstName,
          lastName: userData.lastName || lastName,
          profileImageUrl: userData.profileImageUrl || fbUser.photoURL,
          displayName: fbUser.displayName,
          timezone: userData.timezone,
        });
      } else {
        // Even if sync fails, use Firebase data
        setUser({
          id: fbUser.uid,
          email: fbUser.email,
          firstName,
          lastName,
          profileImageUrl: fbUser.photoURL,
          displayName: fbUser.displayName,
        });
      }
    } catch (err) {
      console.error('Error syncing user with backend:', err);
      // Use Firebase data as fallback
      setUser({
        id: fbUser.uid,
        email: fbUser.email,
        firstName: fbUser.displayName?.split(' ')[0] || null,
        lastName: fbUser.displayName?.split(' ').slice(1).join(' ') || null,
        profileImageUrl: fbUser.photoURL,
        displayName: fbUser.displayName,
      });
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        await syncUserWithBackend(fbUser);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserWithBackend]);

  // Auth actions
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, displayName);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithApple();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Apple');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logOut();
      setUser(null);
      queryClient.clear(); // Clear all cached queries
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      throw err;
    }
  }, []);

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    signUp,
    loginWithGoogle,
    loginWithApple,
    logout,
    forgotPassword,
    getIdToken,
  };
}
