import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, UserRole } from '../../types';
import { IUserRepository } from '../interfaces/IUserRepository';

export class FirestoreUserRepository implements IUserRepository {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('FirestoreUserRepository.getUserProfile error:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    } catch (error) {
      console.error('FirestoreUserRepository.saveUserProfile error:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
    } catch (error) {
      console.error('FirestoreUserRepository.updateUserRole error:', error);
      throw error;
    }
  }
}
