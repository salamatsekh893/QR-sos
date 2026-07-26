import { config } from '../config/env';

// Repository Interfaces
import { IUserRepository } from './interfaces/IUserRepository';
import { IMedicalRepository } from './interfaces/IMedicalRepository';
import { IQRRepository } from './interfaces/IQRRepository';
import { ISOSRepository } from './interfaces/ISOSRepository';
import { IOrderRepository } from './interfaces/IOrderRepository';

// Firestore Implementations
import { FirestoreUserRepository } from './firestore/FirestoreUserRepository';
import { FirestoreMedicalRepository } from './firestore/FirestoreMedicalRepository';
import { FirestoreQRRepository } from './firestore/FirestoreQRRepository';
import { FirestoreSOSRepository } from './firestore/FirestoreSOSRepository';
import { FirestoreOrderRepository } from './firestore/FirestoreOrderRepository';

// MySQL Express API Implementations
import { ApiUserRepository } from './api/ApiUserRepository';
import { ApiMedicalRepository } from './api/ApiMedicalRepository';
import { ApiQRRepository } from './api/ApiQRRepository';
import { ApiSOSRepository } from './api/ApiSOSRepository';
import { ApiOrderRepository } from './api/ApiOrderRepository';

const useApi = config.dbDriver === 'mysql_api';

export const userRepository: IUserRepository = useApi
  ? new ApiUserRepository()
  : new FirestoreUserRepository();

export const medicalRepository: IMedicalRepository = useApi
  ? new ApiMedicalRepository()
  : new FirestoreMedicalRepository();

export const qrRepository: IQRRepository = useApi
  ? new ApiQRRepository()
  : new FirestoreQRRepository();

export const sosRepository: ISOSRepository = useApi
  ? new ApiSOSRepository()
  : new FirestoreSOSRepository();

export const orderRepository: IOrderRepository = useApi
  ? new ApiOrderRepository()
  : new FirestoreOrderRepository();
