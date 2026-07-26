import { ProductOrder, WalletTransaction } from '../../types';

export interface IOrderRepository {
  subscribeToUserOrders(userId: string, callback: (orders: ProductOrder[]) => void): () => void;
  createOrder(order: ProductOrder): Promise<void>;
  subscribeToUserWalletTransactions(userId: string, callback: (txs: WalletTransaction[]) => void): () => void;
}
