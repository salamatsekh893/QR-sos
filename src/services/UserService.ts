import { UserProfile, UserRole, AccountStatus } from '../types';
import { userRepository } from '../repositories';
import { subscribeToAllUsers as subscribeUsersFirestore, updateUserRoleAndStatus as updateRoleAndStatusFirestore } from './firestoreService';

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

  static subscribeAllUsers(callback: (users: UserProfile[]) => void): () => void {
    return subscribeUsersFirestore(callback);
  }

  static async updateRoleAndStatus(
    userId: string,
    role: UserRole,
    accountStatus: AccountStatus
  ): Promise<void> {
    return updateRoleAndStatusFirestore(userId, role, accountStatus);
  }
}
