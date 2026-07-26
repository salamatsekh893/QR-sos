import { SOSAlert } from '../../types';

export interface ISOSRepository {
  triggerSOSAlert(alert: SOSAlert): Promise<void>;
  subscribeToActiveSOSAlerts(callback: (alerts: SOSAlert[]) => void): () => void;
  updateSOSAlertStatus(
    alertId: string,
    status: 'ACTIVE' | 'DISPATCHED' | 'RESOLVED',
    notes?: string
  ): Promise<void>;
}
