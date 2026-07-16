import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  role: 'client' | 'admin' | 'super_admin' | null;
  isApproved: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: 'client' | 'admin' | 'super_admin' | null) => void;
  setIsApproved: (isApproved: boolean) => void;
  setLoading: (loading: boolean) => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isApproved: false,
      loading: true,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setIsApproved: (isApproved) => set({ isApproved }),
      setLoading: (loading) => set({ loading }),
      initAuth: () => {
        onAuthStateChanged(auth, async (user) => {
          set({ user, loading: true });
          if (user) {
            // Check if user is an admin
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));
            if (adminDoc.exists()) {
              const data = adminDoc.data();
              set({ 
                role: data.role || 'admin', 
                isApproved: data.isApproved || false 
              });
            } else {
              // Default to client role
              set({ role: 'client', isApproved: true });
            }
          } else {
            set({ role: null, isApproved: false });
          }
          set({ loading: false });
        });
      },
    }),
    {
      name: 'salaf-auth',
      partialize: (state) => ({ role: state.role, isApproved: state.isApproved }),
    }
  )
);
