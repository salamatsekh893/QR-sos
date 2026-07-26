export type UserRole = 'Customer' | 'Super Admin' | 'Distributor' | 'Emergency Responder';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  bloodGroup?: string;
  gender?: string;
  dob?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  role: UserRole;
  profileCompleted?: boolean;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  priority: 'Primary' | 'Secondary' | 'Guardian';
  email?: string;
}

export interface MedicalProfile {
  userId: string;
  bloodGroup: string;
  allergies?: string;
  chronicDiseases?: string;
  currentMedications?: string;
  doctorName?: string;
  doctorPhone?: string;
  hospitalName?: string;
  insurancePolicyNo?: string;
  organDonor?: boolean;
  emergencyNotes?: string;
}

export type QRType =
  | 'Personal'
  | 'Vehicle'
  | 'Child'
  | 'Senior Citizen'
  | 'Women Safety'
  | 'Pet'
  | 'Helmet'
  | 'Bag'
  | 'Home';

export interface QRCodeTag {
  id: string;
  userId: string;
  title: string;
  qrType: QRType;
  code: string;
  assignedName: string;
  bloodGroup?: string;
  emergencyPhone: string;
  vehicleNo?: string;
  notes?: string;
  isActive: boolean;
  scansCount: number;
  createdAt: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISPATCHED';
  alertType: '1-Click SOS' | 'Shake Alert' | 'Silent SOS' | 'Accident Detection';
  batteryLevel?: number;
  createdAt: string;
  resolvedAt?: string;
  responderNotes?: string;
  responderName?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  badge?: string;
}

export interface ProductOrder {
  id: string;
  userId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: 'PENDING' | 'DISPATCHED' | 'DELIVERED';
  shippingAddress: string;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'COMMISSION';
  description: string;
  createdAt: string;
}

export interface EmergencyDirectoryItem {
  id: string;
  category: 'Hospital' | 'Ambulance' | 'Police' | 'Fire Station' | 'Blood Bank' | 'Helpline';
  name: string;
  phone: string;
  address: string;
  city: string;
  available24x7: boolean;
}
