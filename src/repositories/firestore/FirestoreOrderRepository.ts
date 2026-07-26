import {
  doc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ProductOrder, WalletTransaction } from '../../types';
import { IOrderRepository } from '../interfaces/IOrderRepository';

export class FirestoreOrderRepository implements IOrderRepository {
  subscribeToUserOrders(
    userId: string,
    callback: (orders: ProductOrder[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'product_orders'),
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
          console.error('FirestoreOrderRepository.subscribeToUserOrders error:', error);
        }
      );
    } catch (error) {
      console.error('FirestoreOrderRepository.subscribeToUserOrders init error:', error);
      return () => {};
    }
  }

  async createOrder(order: ProductOrder): Promise<void> {
    try {
      await setDoc(doc(db, 'product_orders', order.id), order);
    } catch (error) {
      console.error('FirestoreOrderRepository.createOrder error:', error);
      throw error;
    }
  }

  subscribeToUserWalletTransactions(
    userId: string,
    callback: (txs: WalletTransaction[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, 'wallet_transactions'),
        where('userId', '==', userId)
      );
      return onSnapshot(
        q,
        (snapshot) => {
          const txs = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as WalletTransaction[];
          callback(txs);
        },
        (error) => {
          console.error('FirestoreOrderRepository.subscribeToUserWalletTransactions error:', error);
        }
      );
    } catch (error) {
      console.error('FirestoreOrderRepository.subscribeToUserWalletTransactions init error:', error);
      return () => {};
    }
  }
}
