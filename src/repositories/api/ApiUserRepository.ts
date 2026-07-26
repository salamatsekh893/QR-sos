import { UserProfile, UserRole } from '../../types';
import { IUserRepository } from '../interfaces/IUserRepository';
import { config } from '../../config/env';

export class ApiUserRepository implements IUserRepository {
  private baseUrl = config.apiBaseUrl;

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${this.baseUrl}/users/${userId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error('ApiUserRepository.getUserProfile error:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/users/${profile.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (error) {
      console.error('ApiUserRepository.saveUserProfile error:', error);
      throw error;
    }
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (error) {
      console.error('ApiUserRepository.updateUserRole error:', error);
      throw error;
    }
  }
}
