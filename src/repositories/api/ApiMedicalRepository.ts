import { MedicalProfile, EmergencyContact } from '../../types';
import { IMedicalRepository } from '../interfaces/IMedicalRepository';
import { config } from '../../config/env';

export class ApiMedicalRepository implements IMedicalRepository {
  private baseUrl = config.apiBaseUrl;

  async getMedicalProfile(userId: string): Promise<MedicalProfile | null> {
    try {
      const res = await fetch(`${this.baseUrl}/medical/${userId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error('ApiMedicalRepository.getMedicalProfile error:', error);
      return null;
    }
  }

  async saveMedicalProfile(profile: MedicalProfile): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/medical/${profile.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (error) {
      console.error('ApiMedicalRepository.saveMedicalProfile error:', error);
      throw error;
    }
  }

  subscribeToEmergencyContacts(
    userId: string,
    callback: (contacts: EmergencyContact[]) => void
  ): () => void {
    let active = true;
    const fetchContacts = async () => {
      try {
        const res = await fetch(`${this.baseUrl}/medical/${userId}/contacts`);
        if (res.ok && active) {
          const data = await res.json();
          callback(data);
        }
      } catch (err) {
        console.error('ApiMedicalRepository.subscribeToEmergencyContacts polling error:', err);
      }
    };

    fetchContacts();
    const interval = setInterval(fetchContacts, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  async saveEmergencyContact(contact: EmergencyContact): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/medical/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
    } catch (error) {
      console.error('ApiMedicalRepository.saveEmergencyContact error:', error);
      throw error;
    }
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/medical/contacts/${contactId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('ApiMedicalRepository.deleteEmergencyContact error:', error);
      throw error;
    }
  }
}
