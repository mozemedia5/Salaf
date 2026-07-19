import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { AdminUser } from '@/types';

// If the signed-in user has no `admins/{uid}` doc yet but was invited via
// `admin_invites/{email}`, create their real admin doc from the invite so the
// existing approval flow (AdminManagement.handleApprove) can find and approve
// them. The invite stays pending (isApproved: false) until a super admin
// approves the linked admins/{uid} doc.
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

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);

      if (firebaseUser) {
        try {
          const adminDocRef = doc(db, 'admins', firebaseUser.uid);
          let adminDoc = await getDoc(adminDocRef);

          if (!adminDoc.exists()) {
            // Try to self-link a pending invite into a real admins/{uid} doc.
            try {
              await linkInviteIfPending(firebaseUser);
              adminDoc = await getDoc(adminDocRef);
            } catch (linkErr) {
              console.error('Admin invite linking failed:', linkErr);
            }
          }

          if (adminDoc.exists()) {
            const data = adminDoc.data() as AdminUser;
            if (data.isApproved && data.role) {
              setAdminProfile({ ...data, id: firebaseUser.uid });
              setIsAdmin(true);
              setIsSuperAdmin(data.role === 'super_admin');

              // Update last login
              await updateDoc(adminDocRef, {
                lastLoginAt: serverTimestamp(),
              });
            } else {
              setError('Your admin account is pending approval.');
              setIsAdmin(false);
              setIsSuperAdmin(false);
            }
          } else {
            setIsAdmin(false);
            setIsSuperAdmin(false);
            setAdminProfile(null);
          }
        } catch (err: any) {
          console.error('Admin auth error:', err);
          setError(err.message);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      } else {
        setAdminProfile(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is an admin
      const adminDocRef = doc(db, 'admins', result.user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error('You are not authorized as an admin.');
      }

      const data = adminDoc.data() as AdminUser;
      if (!data.isApproved) {
        await signOut(auth);
        throw new Error('Your admin account is pending approval by the supreme admin.');
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createAdmin = async (
    adminData: Omit<AdminUser, 'id' | 'createdAt' | 'permissions'> & { permissions?: Partial<AdminUser['permissions']> }
  ) => {
    setError(null);
    try {
      // Create a document in admins collection with pending status
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
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const approveAdmin = async (adminId: string) => {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await updateDoc(adminRef, {
        isApproved: true,
        isEmailVerified: true,
        approvedAt: serverTimestamp(),
        approvedBy: user?.uid,
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAdminProfile(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  const hasPermission = useCallback((permission: keyof AdminUser['permissions']) => {
    if (isSuperAdmin) return true;
    return adminProfile?.permissions[permission] ?? false;
  }, [isSuperAdmin, adminProfile]);

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
