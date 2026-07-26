import { SOSAlert } from '../../types';
import { ISOSRepository } from '../interfaces/ISOSRepository';
import { config } from '../../config/env';

export class ApiSOSRepository implements ISOSRepository {
  private baseUrl = config.apiBaseUrl;

  async triggerSOSAlert(alert: SOSAlert): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('ApiSOSRepository.triggerSOSAlert error:', error);
      throw error;
    }
  }

  subscribeToActiveSOSAlerts(
    callback: (alerts: SOSAlert[]) => void
  ): () => void {
    let active = true;
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${this.baseUrl}/sos/active`);
        if (res.ok && active) {
          const data = await res.json();
          callback(data);
        }
      } catch (err) {
        console.error('ApiSOSRepository polling error:', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }

  async updateSOSAlertStatus(
    alertId: string,
    status: 'ACTIVE' | 'DISPATCHED' | 'RESOLVED',
    notes?: string
  ): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/sos/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, responderNotes: notes }),
      });
    } catch (error) {
      console.error('ApiSOSRepository.updateSOSAlertStatus error:', error);
      throw error;
    }
  }
}
