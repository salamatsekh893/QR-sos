import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  UserProfile,
  EmergencyContact,
  MedicalProfile,
  QRCodeTag,
  SOSAlert,
  ProductOrder,
  WalletTransaction
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ================= USER PROFILES =================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= MEDICAL PROFILE =================

export async function getMedicalProfile(userId: string): Promise<MedicalProfile | null> {
  const path = `medical_profiles/${userId}`;
  try {
    const docRef = doc(db, 'medical_profiles', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MedicalProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveMedicalProfile(profile: MedicalProfile): Promise<void> {
  const path = `medical_profiles/${profile.userId}`;
  try {
    await setDoc(doc(db, 'medical_profiles', profile.userId), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ================= EMERGENCY CONTACTS =================

export function subscribeToEmergencyContacts(
  userId: string,
  callback: (contacts: EmergencyContact[]) => void
) {
  const path = 'emergency_contacts';
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
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function saveEmergencyContact(contact: EmergencyContact): Promise<void> {
  const path = `emergency_contacts/${contact.id}`;
  try {
    await setDoc(doc(db, 'emergency_contacts', contact.id), contact, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEmergencyContact(contactId: string): Promise<void> {
  const path = `emergency_contacts/${contactId}`;
  try {
    await deleteDoc(doc(db, 'emergency_contacts', contactId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= QR CODE TAGS =================

export function subscribeToUserQRCodes(
  userId: string,
  callback: (tags: QRCodeTag[]) => void
) {
  const path = 'qr_codes';
  try {
    const q = query(
      collection(db, 'qr_codes'),
      where('userId', '==', userId)
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
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function getQRCodeTag(qrId: string): Promise<QRCodeTag | null> {
  const path = `qr_codes/${qrId}`;
  try {
    const docRef = doc(db, 'qr_codes', qrId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as QRCodeTag;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function createQRCodeTag(tag: QRCodeTag): Promise<void> {
  const path = `qr_codes/${tag.id}`;
  try {
    await setDoc(doc(db, 'qr_codes', tag.id), tag);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function incrementQRScan(qrId: string): Promise<void> {
  const path = `qr_codes/${qrId}`;
  try {
    const docRef = doc(db, 'qr_codes', qrId);
    await updateDoc(docRef, {
      scansCount: increment(1)
    });
  } catch (error) {
    // Non-fatal scan increment error fallback
    console.warn('Scan count increment error:', error);
  }
}

export async function deleteQRCodeTag(qrId: string): Promise<void> {
  const path = `qr_codes/${qrId}`;
  try {
    await deleteDoc(doc(db, 'qr_codes', qrId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ================= SOS ALERTS (REAL-TIME LIVE UPDATES) =================

export function subscribeToActiveSOSAlerts(
  callback: (alerts: SOSAlert[]) => void
) {
  const path = 'sos_alerts';
  try {
    const q = query(
      collection(db, 'sos_alerts'),
      orderBy('createdAt', 'desc'),
      limit(50)
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
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function triggerSOSAlert(alert: SOSAlert): Promise<void> {
  const path = `sos_alerts/${alert.id}`;
  try {
    await setDoc(doc(db, 'sos_alerts', alert.id), alert);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function resolveSOSAlert(alertId: string): Promise<void> {
  const path = `sos_alerts/${alertId}`;
  try {
    const docRef = doc(db, 'sos_alerts', alertId);
    await updateDoc(docRef, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ================= ORDERS & TRANSACTIONS =================

export function subscribeToUserOrders(
  userId: string,
  callback: (orders: ProductOrder[]) => void
) {
  const path = 'orders';
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as ProductOrder[];
        callback(orders);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function createProductOrder(order: ProductOrder): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToWalletTransactions(
  userId: string,
  callback: (transactions: WalletTransaction[]) => void
) {
  const path = 'wallet_transactions';
  try {
    const q = query(
      collection(db, 'wallet_transactions'),
      where('userId', '==', userId)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const trans = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as WalletTransaction[];
        callback(trans);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

export async function addWalletTransaction(trans: WalletTransaction): Promise<void> {
  const path = `wallet_transactions/${trans.id}`;
  try {
    await setDoc(doc(db, 'wallet_transactions', trans.id), trans);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
