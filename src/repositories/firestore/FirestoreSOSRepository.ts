import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SOSAlert } from '../../types';
import { ISOSRepository } from '../interfaces/ISOSRepository';

export class FirestoreSOSRepository implements ISOSRepository {
  async triggerSOSAlert(alert: SOSAlert): Promise<void> {
    try {
      await setDoc(doc(db, 'sos_alerts', alert.id), alert);
    } catch (error) {
      console.error('FirestoreSOSRepository.triggerSOSAlert error:', error);
      throw error;
    }
  }

  subscribeToActiveSOSAlerts(
    callback: (alerts: SOSAlert[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'sos_alerts'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const alerts = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as SOSAlert[];
          callback(alerts);
        },
        (error) => {
          console.error('FirestoreSOSRepository.subscribeToActiveSOSAlerts error:', error);
        }
      );
    } catch (error) {
      console.error('FirestoreSOSRepository.subscribeToActiveSOSAlerts init error:', error);
      return () => {};
    }
  }

  async updateSOSAlertStatus(
    alertId: string,
    status: 'ACTIVE' | 'DISPATCHED' | 'RESOLVED',
    notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'sos_alerts', alertId);
      const updateData: Record<string, unknown> = { status };
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date().toISOString();
      }
      if (notes) {
        updateData.responderNotes = notes;
      }
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('FirestoreSOSRepository.updateSOSAlertStatus error:', error);
      throw error;
    }
  }
}
