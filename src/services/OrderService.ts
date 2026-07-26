import { ProductOrder, WalletTransaction } from '../types';
import { orderRepository } from '../repositories';

export class OrderService {
  static subscribeUserOrders(
    userId: string,
    callback: (orders: ProductOrder[]) => void
  ): () => void {
    return orderRepository.subscribeToUserOrders(userId, callback);
  }

  static async createOrder(order: ProductOrder): Promise<void> {
    return orderRepository.createOrder(order);
  }

  static subscribeUserWalletTransactions(
    userId: string,
    callback: (txs: WalletTransaction[]) => void
  ): () => void {
    return orderRepository.subscribeToUserWalletTransactions(userId, callback);
  }
}
