import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { CompleteProfileOnboarding } from './components/CompleteProfileOnboarding';

import { SOSModule } from './components/SOSModule';
import { QRManagement } from './components/QRManagement';
import { QRScanPage } from './components/QRScanPage';
import { MedicalAndFamily } from './components/MedicalAndFamily';
import { EmergencyDirectory } from './components/EmergencyDirectory';
import { ShopAndWallet } from './components/ShopAndWallet';
import { subscribeToActiveSOSAlerts } from './services/firestoreService';

import { CustomerDashboard } from './components/dashboards/CustomerDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { EmergencyResponderDashboard } from './components/dashboards/EmergencyResponderDashboard';
import { DistributorDashboard } from './components/dashboards/DistributorDashboard';
import { BranchAdminDashboard } from './components/dashboards/BranchAdminDashboard';
import { RoleGuard } from './components/dashboards/RoleGuard';
import { ShieldAlert, RefreshCw } from 'lucide-react';

function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('sos');
  const [activeScanQrId, setActiveScanQrId] = useState<string | null>(null);
  const [activeSOSCount, setActiveSOSCount] = useState<number>(0);

  // Automatically redirect users to their role-specific dashboard on login or live role update
  useEffect(() => {
    if (!userProfile) return;
    const role = userProfile.role;
    if (role === 'Super Admin' && activeTab !== 'admin' && activeTab !== 'scanner') {
      setActiveTab('admin');
    } else if (role === 'Emergency Responder' && activeTab !== 'responder' && activeTab !== 'scanner') {
      setActiveTab('responder');
    } else if (role === 'Distributor' && activeTab !== 'distributor' && activeTab !== 'scanner') {
      setActiveTab('distributor');
    } else if (role === 'Branch Admin' && activeTab !== 'branch' && activeTab !== 'scanner') {
      setActiveTab('branch');
    } else if (role === 'Customer' && ['admin', 'responder', 'distributor', 'branch'].includes(activeTab)) {
      setActiveTab('sos');
    }
  }, [userProfile?.role]);

  // Check URL query param for direct public QR scan link (e.g. ?qr=SL_123456)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrParam = params.get('qr');
    if (qrParam) {
      setActiveScanQrId(qrParam);
      setActiveTab('scanner');
    }
  }, []);

  // Real-time active SOS badge count
  useEffect(() => {
    const unsubscribe = subscribeToActiveSOSAlerts((alerts) => {
      const activeOnly = alerts.filter((a) => a.status === 'ACTIVE').length;
      setActiveSOSCount(activeOnly);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenScanner = (qrId: string) => {
    setActiveScanQrId(qrId);
    setActiveTab('scanner');
  };

  // 1. Loading State Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="bg-red-600 p-4 rounded-3xl shadow-2xl shadow-red-600/40 animate-pulse mb-6 ring-2 ring-red-400/50">
          <ShieldAlert className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-black tracking-wider uppercase mb-2">SAFE LIFE PLUS</h2>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full shadow-inner">
          <RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
          <span>Authenticating Security Vault & Syncing Profile...</span>
        </div>
      </div>
    );
  }

  // 2. Public QR Scanner Mode (Accessible directly via link for Good Samaritans / First Responders)
  if (activeTab === 'scanner' && activeScanQrId) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSOSCount={activeSOSCount}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <QRScanPage
            qrId={activeScanQrId}
            onBack={() => {
              setActiveScanQrId(null);
              setActiveTab('qr');
            }}
          />
        </main>
      </div>
    );
  }

  // 3. Unauthenticated State Gate (Never allow direct access to Dashboard)
  if (!user || !userProfile) {
    return <LoginPage />;
  }

  // 4. Onboarding Gate (If profileCompleted is false, force Complete Profile Wizard)
  if (userProfile.profileCompleted !== true) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col justify-between">
        <div>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeSOSCount={activeSOSCount}
          />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CompleteProfileOnboarding />
          </main>
        </div>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          SAFE LIFE Enterprise • Complete Onboarding Wizard Required Before Dashboard Access
        </footer>
      </div>
    );
  }

  // 5. Authenticated & Verified Profile -> Render Full Dashboard
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSOSCount={activeSOSCount}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'scanner' && !activeScanQrId && (
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900">Scan Emergency QR Tag</h3>
              <p className="text-xs text-slate-600">
                To test public emergency QR scanning, click "View Public Scan" on any created QR tag in the "My QR Codes" tab.
              </p>
              <button
                onClick={() => setActiveTab('qr')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md"
              >
                Go to QR Tags List
              </button>
            </div>
          )}

          {/* Customer Dashboard / Core Modules */}
          {activeTab === 'sos' && (
            <CustomerDashboard activeTab="sos" setActiveTab={setActiveTab} onScanQR={handleOpenScanner} />
          )}
          {activeTab === 'qr' && <QRManagement onScanQR={handleOpenScanner} />}
          {activeTab === 'medical' && <MedicalAndFamily />}
          {activeTab === 'directory' && <EmergencyDirectory />}
          {activeTab === 'shop' && <ShopAndWallet />}

          {/* Protected Role-Based Dashboards */}
          {activeTab === 'admin' && (
            <RoleGuard allowedRoles={['Super Admin']} onFallbackToCustomer={() => setActiveTab('sos')}>
              <SuperAdminDashboard />
            </RoleGuard>
          )}

          {activeTab === 'responder' && (
            <RoleGuard allowedRoles={['Emergency Responder', 'Super Admin']} onFallbackToCustomer={() => setActiveTab('sos')}>
              <EmergencyResponderDashboard />
            </RoleGuard>
          )}

          {activeTab === 'distributor' && (
            <RoleGuard allowedRoles={['Distributor', 'Super Admin']} onFallbackToCustomer={() => setActiveTab('sos')}>
              <DistributorDashboard />
            </RoleGuard>
          )}

          {activeTab === 'branch' && (
            <RoleGuard allowedRoles={['Branch Admin', 'Super Admin']} onFallbackToCustomer={() => setActiveTab('sos')}>
              <BranchAdminDashboard />
            </RoleGuard>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-900 bg-blue-950 py-6 text-center text-xs text-blue-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-yellow-400 font-bold">SAFE LIFE Enterprise</strong> • India's Emergency QR & Live Safety Ecosystem
          </div>
          <div className="font-mono text-[11px] text-blue-300">
            Role-Based Multi-Portal Architecture • Powered by Services & Repositories Layer
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
