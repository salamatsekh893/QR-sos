import { SOSAlert } from '../types';
import { sosRepository } from '../repositories';

export class SOSService {
  static async triggerAlert(alert: SOSAlert): Promise<void> {
    return sosRepository.triggerSOSAlert(alert);
  }

  static subscribeActiveAlerts(
    callback: (alerts: SOSAlert[]) => void
  ): () => void {
    return sosRepository.subscribeToActiveSOSAlerts(callback);
  }

  static async updateStatus(
    alertId: string,
    status: 'ACTIVE' | 'DISPATCHED' | 'RESOLVED',
    notes?: string
  ): Promise<void> {
    return sosRepository.updateSOSAlertStatus(alertId, status, notes);
  }
}
