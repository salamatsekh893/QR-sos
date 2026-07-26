import { UserProfile, UserRole } from '../types';
import { userRepository } from '../repositories';

export class UserService {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    return userRepository.getUserProfile(userId);
  }

  static async saveProfile(profile: UserProfile): Promise<void> {
    return userRepository.saveUserProfile(profile);
  }

  static async updateRole(userId: string, role: UserRole): Promise<void> {
    return userRepository.updateUserRole(userId, role);
  }
}
