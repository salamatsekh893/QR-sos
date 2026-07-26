import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { QRCodeTag } from '../../types';
import { IQRRepository } from '../interfaces/IQRRepository';

export class FirestoreQRRepository implements IQRRepository {
  async getQRCodeTag(qrId: string): Promise<QRCodeTag | null> {
    try {
      const snap = await getDoc(doc(db, 'qr_tags', qrId));
      if (snap.exists()) {
        return snap.data() as QRCodeTag;
      }
      return null;
    } catch (error) {
      console.error('FirestoreQRRepository.getQRCodeTag error:', error);
      return null;
    }
  }

  subscribeToUserQRTags(
    userId: string,
    callback: (tags: QRCodeTag[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'qr_tags'),
        where('assignedUserId', '==', userId)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const tags = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as QRCodeTag[];
          callback(tags);
        },
        (error) => {
          console.error('FirestoreQRRepository.subscribeToUserQRTags error:', error);
        }
      );
    } catch (error) {
      console.error('FirestoreQRRepository.subscribeToUserQRTags init error:', error);
      return () => {};
    }
  }

  async saveQRCodeTag(tag: QRCodeTag): Promise<void> {
    try {
      await setDoc(doc(db, 'qr_tags', tag.id), tag, { merge: true });
    } catch (error) {
      console.error('FirestoreQRRepository.saveQRCodeTag error:', error);
      throw error;
    }
  }

  async toggleQRLock(tagId: string, isLocked: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'qr_tags', tagId), { isLocked });
    } catch (error) {
      console.error('FirestoreQRRepository.toggleQRLock error:', error);
      throw error;
    }
  }
}
