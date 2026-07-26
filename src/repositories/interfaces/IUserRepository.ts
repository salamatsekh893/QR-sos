import { UserProfile, UserRole } from '../../types';

export interface IUserRepository {
  getUserProfile(userId: string): Promise<UserProfile | null>;
  saveUserProfile(profile: UserProfile): Promise<void>;
  updateUserRole(userId: string, role: UserRole): Promise<void>;
}
