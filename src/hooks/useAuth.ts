import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email: string, pass: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) return;
    setError(null);
    try {
      await updateProfile(auth.currentUser, { displayName, photoURL });
      setUser({ ...auth.currentUser }); // Force update state
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) return;
    setError(null);
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    user, loading, error, 
    login, signup, logout, 
    loginWithGoogle, resetPassword,
    updateUserProfile, updateUserPassword 
  };
}
