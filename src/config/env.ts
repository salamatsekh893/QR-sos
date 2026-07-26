export type DatabaseDriver = 'firestore' | 'mysql_api';

export interface AppConfig {
  dbDriver: DatabaseDriver;
  apiBaseUrl: string;
  isProduction: boolean;
}

const metaEnv = (import.meta as unknown as { env?: Record<string, string | boolean> }).env || {};

export const config: AppConfig = {
  // Controlled via environment variable VITE_DB_DRIVER or defaults to 'firestore'
  dbDriver: (metaEnv.VITE_DB_DRIVER as DatabaseDriver) || 'firestore',
  apiBaseUrl: (metaEnv.VITE_API_URL as string) || '/api',
  isProduction: Boolean(metaEnv.PROD),
};
