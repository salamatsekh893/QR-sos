import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MedicalProfile, EmergencyContact } from '../../types';
import { IMedicalRepository } from '../interfaces/IMedicalRepository';

export class FirestoreMedicalRepository implements IMedicalRepository {
  async getMedicalProfile(userId: string): Promise<MedicalProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'medical_profiles', userId));
      if (snap.exists()) {
        return snap.data() as MedicalProfile;
      }
      return null;
    } catch (error) {
      console.error('FirestoreMedicalRepository.getMedicalProfile error:', error);
      return null;
    }
  }

  async saveMedicalProfile(profile: MedicalProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'medical_profiles', profile.userId), profile, { merge: true });
    } catch (error) {
      console.error('FirestoreMedicalRepository.saveMedicalProfile error:', error);
      throw error;
    }
  }

  subscribeToEmergencyContacts(
    userId: string,
    callback: (contacts: EmergencyContact[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'emergency_contacts'),
        where('userId', '==', userId)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const contacts = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as EmergencyContact[];
          callback(contacts);
        },
        (error) => {
          console.error('FirestoreMedicalRepository.subscribeToEmergencyContacts error:', error);
        }
      );
    } catch (error) {
      console.error('FirestoreMedicalRepository.subscribeToEmergencyContacts init error:', error);
      return () => {};
    }
  }

  async saveEmergencyContact(contact: EmergencyContact): Promise<void> {
    try {
      await setDoc(doc(db, 'emergency_contacts', contact.id), contact, { merge: true });
    } catch (error) {
      console.error('FirestoreMedicalRepository.saveEmergencyContact error:', error);
      throw error;
    }
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'emergency_contacts', contactId));
    } catch (error) {
      console.error('FirestoreMedicalRepository.deleteEmergencyContact error:', error);
      throw error;
    }
  }
}
