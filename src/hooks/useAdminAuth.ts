/**
 * useAdminAuth
 *
 * A thin wrapper around the global authStore.
 * All components that previously called useAdminAuth() still work without
 * changes, but now they read from a single, already-initialized auth listener
 * instead of each spinning up their own onAuthStateChanged() — which caused
 * the race condition where the admin dashboard showed "Access Denied" on first
 * load because the Firestore check hadn't resolved yet.
 */
import { useCallback } from 'react';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import type { AdminUser } from '@/types';

export function useAdminAuth() {
  const {
    user,
    adminProfile,
    loading,
    role,
    isApproved,
  } = useAuthStore();

  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin());

  // Build a user-friendly error when not an admin
  const error = (() => {
    if (loading) return null;
    if (!user) return null;
    if (role === 'client') return null; // regular user, no error needed
    if ((role === 'admin' || role === 'super_admin') && !isApproved) {
      return 'Your admin account is pending approval by the supreme admin.';
    }
    return null;
  })();

  /**
   * Admin-specific login: signs in via Firebase Auth, verifies the admins/{uid}
   * document, and throws descriptive errors if the check fails.
   * The authStore's onAuthStateChanged listener will then update all state.
   */
  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);

    const adminDocRef = doc(db, 'admins', result.user.uid);
    const adminDoc = await getDoc(adminDocRef);

    if (!adminDoc.exists()) {
      await signOut(auth);
      throw new Error('You are not registered as an admin. Please use the Client login.');
    }

    const data = adminDoc.data() as AdminUser;
    if (!data.isApproved) {
      await signOut(auth);
      throw new Error('Your admin account is pending approval by the supreme admin.');
    }

    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const createAdmin = async (
    adminData: Omit<AdminUser, 'id' | 'createdAt' | 'permissions'> & {
      permissions?: Partial<AdminUser['permissions']>;
    }
  ) => {
    const newAdminRef = doc(db, 'admin_invites', adminData.email.toLowerCase());

    const defaultPermissions: AdminUser['permissions'] = {
      canManageVideos: true,
      canManageArticles: true,
      canManageGallery: true,
      canManageDonations: true,
      canManageBanners: false,
      canManageAdmins: false,
      canManageNotifications: true,
      canAnswerQuestions: true,
    };

    await setDoc(newAdminRef, {
      ...adminData,
      email: adminData.email.toLowerCase(),
      permissions: { ...defaultPermissions, ...adminData.permissions },
      isApproved: false,
      createdAt: serverTimestamp(),
      createdBy: user?.uid,
    });

    return true;
  };

  const approveAdmin = async (adminId: string) => {
    const adminRef = doc(db, 'admins', adminId);
    await updateDoc(adminRef, {
      isApproved: true,
      isEmailVerified: true,
      approvedAt: serverTimestamp(),
      approvedBy: user?.uid,
    });
  };

  const hasPermission = useCallback(
    (permission: keyof AdminUser['permissions']) => {
      if (!isApproved) return false;
      if (isSuperAdmin) return true;
      return adminProfile?.permissions[permission] ?? false;
    },
    [isSuperAdmin, adminProfile, isApproved]
  );

  return {
    user,
    adminProfile,
    loading,
    error,
    isAdmin,
    isSuperAdmin,
    login,
    logout,
    createAdmin,
    approveAdmin,
    hasPermission,
  };
}
