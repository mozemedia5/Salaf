import { create } from 'zustand';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { AdminUser } from '@/types';

interface AuthState {
  user: User | null;
  adminProfile: AdminUser | null;
  role: 'client' | 'admin' | 'super_admin' | null;
  isApproved: boolean;
  loading: boolean;
  initialized: boolean;

  // Setters (for internal use)
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  // Computed helpers
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  hasPermission: (permission: keyof AdminUser['permissions']) => boolean;

  // Init (call once from App root)
  initAuth: () => () => void;
}

// Try to self-link a pending admin invite to create an admins/{uid} doc
async function linkInviteIfPending(firebaseUser: User): Promise<void> {
  const email = firebaseUser.email?.toLowerCase();
  if (!email) return;
  const inviteRef = doc(db, 'admin_invites', email);
  const inviteSnap = await getDoc(inviteRef);
  if (!inviteSnap.exists()) return;
  const invite = inviteSnap.data();
  const adminDocRef = doc(db, 'admins', firebaseUser.uid);
  await setDoc(adminDocRef, {
    email,
    displayName: invite.displayName || firebaseUser.displayName || '',
    role: invite.role || 'admin',
    permissions: invite.permissions,
    isApproved: false,
    isEmailVerified: false,
    createdAt: serverTimestamp(),
    createdBy: invite.createdBy || null,
  });
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  adminProfile: null,
  role: null,
  isApproved: false,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  isAdmin: () => {
    const { role, isApproved } = get();
    return (role === 'admin' || role === 'super_admin') && isApproved;
  },
  isSuperAdmin: () => {
    const { role, isApproved } = get();
    return role === 'super_admin' && isApproved;
  },
  hasPermission: (permission) => {
    const { adminProfile, role, isApproved } = get();
    if (!isApproved) return false;
    if (role === 'super_admin') return true;
    return adminProfile?.permissions[permission] ?? false;
  },

  initAuth: () => {
    // Prevent double-initialization
    if (get().initialized) return () => {};
    set({ initialized: true });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      set({ loading: true, user: firebaseUser });

      if (firebaseUser) {
        try {
          const adminDocRef = doc(db, 'admins', firebaseUser.uid);
          let adminDoc = await getDoc(adminDocRef);

          // If no admin doc exists, check for a pending invite and self-link
          if (!adminDoc.exists()) {
            try {
              await linkInviteIfPending(firebaseUser);
              adminDoc = await getDoc(adminDocRef);
            } catch (linkErr) {
              console.warn('Admin invite linking failed:', linkErr);
            }
          }

          if (adminDoc.exists()) {
            const data = adminDoc.data() as AdminUser;
            if (data.isApproved && data.role) {
              set({
                adminProfile: { ...data, id: firebaseUser.uid },
                role: data.role as 'admin' | 'super_admin',
                isApproved: true,
              });
            } else {
              // Admin doc exists but not yet approved — treat as client
              set({ adminProfile: null, role: 'client', isApproved: false });
            }
          } else {
            // Regular client user
            set({ adminProfile: null, role: 'client', isApproved: true });
          }
        } catch (err: any) {
          console.error('Auth store: admin check failed', err);
          set({ adminProfile: null, role: 'client', isApproved: true });
        }
      } else {
        set({ user: null, adminProfile: null, role: null, isApproved: false });
      }

      set({ loading: false });
    });

    return unsubscribe;
  },
}));
