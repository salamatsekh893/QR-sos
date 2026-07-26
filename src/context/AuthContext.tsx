import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { UserService } from '../services/UserService';
import { getOrCreateUserWallet } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult | null>;
  confirmOTP: (confirmationResult: ConfirmationResult, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  completeUserProfile: (updated: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unSubDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unSubDoc) {
        unSubDoc();
        unSubDoc = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        let profile: UserProfile | null = null;
        try {
          profile = await UserService.getProfile(firebaseUser.uid);
        } catch (e) {
          console.warn('Error fetching profile from Firestore:', e);
        }

        // If user document doesn't exist in Firestore, create User, Profile, Wallet, with Role = Customer
        if (!profile) {
          const cleanPhone = firebaseUser.phoneNumber || '';
          profile = {
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || 'Safe Life User',
            email: firebaseUser.email || (cleanPhone ? `${cleanPhone.replace(/\D/g, '')}@safelife.in` : ''),
            phone: cleanPhone,
            bloodGroup: 'O+',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            role: 'Customer', // MANDATORY DEFAULT: Customer
            accountStatus: 'ACTIVE',
            profileCompleted: false, // Triggers Onboarding Wizard for new user
            createdAt: new Date().toISOString(),
          };
          try {
            await UserService.saveProfile(profile);
            await getOrCreateUserWallet(firebaseUser.uid);
          } catch (e) {
            console.warn('Error creating user profile & wallet:', e);
          }
        } else {
          // Ensure wallet exists
          try {
            await getOrCreateUserWallet(firebaseUser.uid);
          } catch (e) {
            console.warn('Wallet check note:', e);
          }
        }

        setUserProfile(profile);
        setLoading(false);

        // Real-time Firestore snapshot listener for profile changes (role, status, profile details)
        unSubDoc = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snapshot) => {
            if (snapshot.exists()) {
              const liveData = snapshot.data() as UserProfile;
              setUserProfile({
                ...liveData,
                accountStatus: liveData.accountStatus || 'ACTIVE',
              });
            }
          },
          (err) => {
            console.warn('User profile live snapshot error:', err);
          }
        );
      } else {
        // Unauthenticated user
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unSubDoc) unSubDoc();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setLoading(false);
      throw err;
    }
  };

  const signInWithPhone = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult | null> => {
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: 'invisible',
        });
      }
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      return confirmationResult;
    } catch (err) {
      console.warn('Recaptcha / Phone Auth error:', err);
      throw err;
    }
  };

  const confirmOTP = async (confirmationResult: ConfirmationResult, code: string) => {
    setLoading(true);
    try {
      await confirmationResult.confirm(code);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const updateRole = async (newRole: UserRole) => {
    // Only Super Admin can change roles in the platform
    if (userProfile && userProfile.role === 'Super Admin') {
      const updated = { ...userProfile, role: newRole };
      setUserProfile(updated);
      try {
        await UserService.saveProfile(updated);
      } catch (e) {
        console.warn('Role update note:', e);
      }
    } else {
      console.warn('Customers and unauthorized roles cannot switch roles.');
    }
  };

  const completeUserProfile = async (updated: UserProfile) => {
    const finalProfile: UserProfile = {
      ...updated,
      role: userProfile?.role || 'Customer', // Preserve assigned role, default Customer
      profileCompleted: true,
    };
    setUserProfile(finalProfile);
    await UserService.saveProfile(finalProfile);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign Out Note:', err);
    } finally {
      setUser(null);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithPhone,
        confirmOTP,
        signOut,
        updateRole,
        completeUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
