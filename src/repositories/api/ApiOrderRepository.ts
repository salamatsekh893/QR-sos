import { ProductOrder, WalletTransaction } from '../../types';
import { IOrderRepository } from '../interfaces/IOrderRepository';
import { config } from '../../config/env';

export class ApiOrderRepository implements IOrderRepository {
  private baseUrl = config.apiBaseUrl;

  subscribeToUserOrders(
    userId: string,
    callback: (orders: ProductOrder[]) => void
  ): () => void {
    let active = true;
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${this.baseUrl}/orders/user/${userId}`);
        if (res.ok && active) {
          const data = await res.json();
          callback(data);
        }
      } catch (err) {
        console.error('ApiOrderRepository orders polling error:', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  async createOrder(order: ProductOrder): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
    } catch (error) {
      console.error('ApiOrderRepository.createOrder error:', error);
      throw error;
    }
  }

  subscribeToUserWalletTransactions(
    userId: string,
    callback: (txs: WalletTransaction[]) => void
  ): () => void {
    let active = true;
    const fetchTxs = async () => {
      try {
        const res = await fetch(`${this.baseUrl}/wallet/transactions/${userId}`);
        if (res.ok && active) {
          const data = await res.json();
          callback(data);
        }
      } catch (err) {
        console.error('ApiOrderRepository txs polling error:', err);
      }
    };

    fetchTxs();
    const interval = setInterval(fetchTxs, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }
}
