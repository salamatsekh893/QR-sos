import { QRCodeTag } from '../../types';
import { IQRRepository } from '../interfaces/IQRRepository';
import { config } from '../../config/env';

export class ApiQRRepository implements IQRRepository {
  private baseUrl = config.apiBaseUrl;

  async getQRCodeTag(qrId: string): Promise<QRCodeTag | null> {
    try {
      const res = await fetch(`${this.baseUrl}/qr/${qrId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error('ApiQRRepository.getQRCodeTag error:', error);
      return null;
    }
  }

  subscribeToUserQRTags(
    userId: string,
    callback: (tags: QRCodeTag[]) => void
  ): () => void {
    let active = true;
    const fetchTags = async () => {
      try {
        const res = await fetch(`${this.baseUrl}/qr/user/${userId}`);
        if (res.ok && active) {
          const data = await res.json();
          callback(data);
        }
      } catch (err) {
        console.error('ApiQRRepository polling error:', err);
      }
    };

    fetchTags();
    const interval = setInterval(fetchTags, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  async saveQRCodeTag(tag: QRCodeTag): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/qr/${tag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag),
      });
    } catch (error) {
      console.error('ApiQRRepository.saveQRCodeTag error:', error);
      throw error;
    }
  }

  async toggleQRLock(tagId: string, isLocked: boolean): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/qr/${tagId}/lock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked }),
      });
    } catch (error) {
      console.error('ApiQRRepository.toggleQRLock error:', error);
      throw error;
    }
  }
}
