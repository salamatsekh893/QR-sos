import { QRCodeTag } from '../types';
import { qrRepository } from '../repositories';

export class QRService {
  static async getTag(qrId: string): Promise<QRCodeTag | null> {
    return qrRepository.getQRCodeTag(qrId);
  }

  static subscribeUserTags(
    userId: string,
    callback: (tags: QRCodeTag[]) => void
  ): () => void {
    return qrRepository.subscribeToUserQRTags(userId, callback);
  }

  static async saveTag(tag: QRCodeTag): Promise<void> {
    return qrRepository.saveQRCodeTag(tag);
  }

  static async toggleLock(tagId: string, locked: boolean): Promise<void> {
    return qrRepository.toggleQRLock(tagId, locked);
  }
}
