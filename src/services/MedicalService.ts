import { MedicalProfile, EmergencyContact } from '../types';
import { medicalRepository } from '../repositories';

export class MedicalService {
  static async getProfile(userId: string): Promise<MedicalProfile | null> {
    return medicalRepository.getMedicalProfile(userId);
  }

  static async saveProfile(profile: MedicalProfile): Promise<void> {
    return medicalRepository.saveMedicalProfile(profile);
  }

  static subscribeContacts(
    userId: string,
    callback: (contacts: EmergencyContact[]) => void
  ): () => void {
    return medicalRepository.subscribeToEmergencyContacts(userId, callback);
  }

  static async saveContact(contact: EmergencyContact): Promise<void> {
    return medicalRepository.saveEmergencyContact(contact);
  }

  static async deleteContact(contactId: string): Promise<void> {
    return medicalRepository.deleteEmergencyContact(contactId);
  }
}
