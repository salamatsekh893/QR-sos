import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { UserService } from '../services/UserService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  demoSignIn: (role?: UserRole, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        let profile: UserProfile | null = null;
        try {
          profile = await UserService.getProfile(firebaseUser.uid);
        } catch (e) {
          console.warn('Error fetching profile, creating fallback:', e);
        }

        if (!profile) {
          profile = {
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || 'Emergency User',
            email: firebaseUser.email || 'user@safelife.in',
            phone: firebaseUser.phoneNumber || '+91 98765 43210',
            bloodGroup: 'O+',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            role: 'Customer',
            createdAt: new Date().toISOString(),
          };
          try {
            await UserService.saveProfile(profile);
          } catch (e) {
            console.warn('Error saving initial profile:', e);
          }
        }
        setUserProfile(profile);
        setLoading(false);
      } else {
        // Sign in anonymously for seamless immediate demo experience with Firebase Auth credentials
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn('Anonymous sign-in error, using local fallback:', err);
          // Fallback if anonymous auth fails
          const fallbackUid = 'demo_user_101';
          const demoProfile: UserProfile = {
            uid: fallbackUid,
            fullName: 'Rajesh Kumar',
            email: 'rajesh.k@safelife.in',
            phone: '+91 98765 12345',
            bloodGroup: 'B+',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            role: 'Customer',
            createdAt: new Date().toISOString(),
          };
          setUserProfile(demoProfile);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setLoading(false);
    }
  };

  const demoSignIn = async (role: UserRole = 'Customer', name: string = 'Demo User') => {
    const uid = user?.uid || `user_${Date.now().toString().slice(-6)}`;
    const profile: UserProfile = {
      uid,
      fullName: name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@safelife.in`,
      phone: '+91 98765 99999',
      bloodGroup: 'AB+',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      role,
      createdAt: new Date().toISOString(),
    };
    setUserProfile(profile);
    try {
      await UserService.saveProfile(profile);
    } catch (e) {
      console.warn('Demo profile save note:', e);
    }
  };

  const updateRole = async (newRole: UserRole) => {
    if (userProfile) {
      const updated = { ...userProfile, role: newRole };
      setUserProfile(updated);
      try {
        await UserService.saveProfile(updated);
      } catch (e) {
        console.warn('Role update note:', e);
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        demoSignIn,
        signOut,
        updateRole,
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
