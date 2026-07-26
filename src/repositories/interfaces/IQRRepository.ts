import { QRCodeTag } from '../../types';

export interface IQRRepository {
  getQRCodeTag(qrId: string): Promise<QRCodeTag | null>;
  subscribeToUserQRTags(userId: string, callback: (tags: QRCodeTag[]) => void): () => void;
  saveQRCodeTag(tag: QRCodeTag): Promise<void>;
  toggleQRLock(tagId: string, locked: boolean): Promise<void>;
}
