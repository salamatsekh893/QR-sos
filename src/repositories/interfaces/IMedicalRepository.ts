import { MedicalProfile, EmergencyContact } from '../../types';

export interface IMedicalRepository {
  getMedicalProfile(userId: string): Promise<MedicalProfile | null>;
  saveMedicalProfile(profile: MedicalProfile): Promise<void>;
  subscribeToEmergencyContacts(userId: string, callback: (contacts: EmergencyContact[]) => void): () => void;
  saveEmergencyContact(contact: EmergencyContact): Promise<void>;
  deleteEmergencyContact(contactId: string): Promise<void>;
}
