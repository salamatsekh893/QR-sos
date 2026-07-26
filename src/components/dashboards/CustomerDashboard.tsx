import React, { useState } from 'react';
import {
  ShieldAlert,
  QrCode,
  HeartPulse,
  Users,
  PhoneCall,
  ShoppingBag,
  Settings,
  User,
  Heart,
  Phone,
  Bell,
  Lock,
  CheckCircle2,
  Shield,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SOSModule } from '../SOSModule';
import { QRManagement } from '../QRManagement';
import { MedicalAndFamily } from '../MedicalAndFamily';
import { EmergencyDirectory } from '../EmergencyDirectory';
import { ShopAndWallet } from '../ShopAndWallet';

interface CustomerDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onScanQR?: (qrId: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  activeTab: externalTab,
  setActiveTab: setExternalTab,
  onScanQR,
}) => {
  const { userProfile } = useAuth();
  const [internalTab, setInternalTab] = useState<string>('sos');

  // Use external tab if provided, otherwise internal state
  const activeTab = externalTab || internalTab;
  const setActiveTab = (tab: string) => {
    if (setExternalTab) setExternalTab(tab);
    setInternalTab(tab);
  };

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const tabs = [
    { id: 'sos', label: 'Live SOS', icon: ShieldAlert, badge: undefined },
    { id: 'qr', label: 'My QR Codes', icon: QrCode },
    { id: 'medical', label: 'Medical Profile', icon: HeartPulse },
    { id: 'family', label: 'Family Members', icon: Users },
    { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
    { id: 'directory', label: 'Helpline Directory', icon: PhoneCall },
    { id: 'shop', label: 'Safety Shop', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 border border-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-yellow-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              Customer Portal
            </span>
            <span className="text-xs text-blue-200 font-mono">Welcome, {userProfile?.fullName || 'Valued User'}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Personal Emergency & Safety Dashboard</h1>
          <p className="text-xs text-blue-100 mt-1">
            Manage your personal emergency QR tags, medical records, panic alerts, and trusted family contacts.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-blue-950/60 p-3 rounded-xl border border-blue-700/50 text-xs">
          <Shield className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <div className="font-extrabold text-white">100% Emergency Protected</div>
            <div className="text-[10px] text-blue-200">24/7 National Dispatch Hotline (112)</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-md space-x-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Views */}
      {activeTab === 'sos' && <SOSModule />}

      {activeTab === 'qr' && <QRManagement onScanQR={onScanQR} />}

      {activeTab === 'medical' && <MedicalAndFamily initialTab="medical" />}

      {activeTab === 'family' && <MedicalAndFamily initialTab="family" />}

      {activeTab === 'contacts' && <MedicalAndFamily initialTab="contacts" />}

      {activeTab === 'directory' && <EmergencyDirectory />}

      {activeTab === 'shop' && <ShopAndWallet />}

      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6 text-slate-900">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Account & Safety Settings</span>
            </h2>
            <p className="text-xs text-slate-500">Configure your safety preferences and personal details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Profile Card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Personal Profile Info</span>
              </h3>
              <div className="space-y-1.5 text-xs text-slate-700">
                <p><strong>Full Name:</strong> {userProfile?.fullName || 'Ramesh Sharma'}</p>
                <p><strong>Email:</strong> {userProfile?.email || 'user@safelife.in'}</p>
                <p><strong>Phone:</strong> {userProfile?.phone || '+91 9876543210'}</p>
                <p><strong>Blood Group:</strong> <span className="text-red-600 font-extrabold">{userProfile?.bloodGroup || 'O+'}</span></p>
                <p><strong>Address:</strong> {userProfile?.address || 'Not provided'}, {userProfile?.district || 'Kolkata'}, {userProfile?.state || 'West Bengal'} - {userProfile?.pincode || '700001'}</p>
              </div>
            </div>

            {/* Notification & Privacy Preferences */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Safety Toggles & Alert Preferences</span>
              </h3>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Push & SMS Emergency Alerts</div>
                  <div className="text-[10px] text-slate-500">Notify family contacts during live SOS signal</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-800">Continuous GPS Tracking During Active SOS</div>
                  <div className="text-[10px] text-slate-500">Allows responders to track live position</div>
                </div>
                <input
                  type="checkbox"
                  checked={locationSharing}
                  onChange={(e) => setLocationSharing(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
