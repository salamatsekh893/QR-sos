import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SOSModule } from './components/SOSModule';
import { QRManagement } from './components/QRManagement';
import { QRScanPage } from './components/QRScanPage';
import { MedicalAndFamily } from './components/MedicalAndFamily';
import { EmergencyDirectory } from './components/EmergencyDirectory';
import { ShopAndWallet } from './components/ShopAndWallet';
import { AdminDashboard } from './components/AdminDashboard';
import { CompleteProfileOnboarding } from './components/CompleteProfileOnboarding';
import { subscribeToActiveSOSAlerts } from './services/firestoreService';

function AppContent() {
  const { userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('sos');
  const [activeScanQrId, setActiveScanQrId] = useState<string | null>(null);
  const [activeSOSCount, setActiveSOSCount] = useState<number>(0);

  // Check URL query param for direct QR scan link (e.g. ?qr=SL_123456)
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

  const isPublicScanner = activeTab === 'scanner' && Boolean(activeScanQrId);
  const needsProfileOnboarding =
    !isPublicScanner &&
    !loading &&
    Boolean(userProfile) &&
    userProfile?.profileCompleted !== true;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSOSCount={activeSOSCount}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {needsProfileOnboarding ? (
            <CompleteProfileOnboarding />
          ) : (
            <>
              {activeTab === 'scanner' && activeScanQrId && (
                <QRScanPage
                  qrId={activeScanQrId}
                  onBack={() => {
                    setActiveScanQrId(null);
                    setActiveTab('qr');
                  }}
                />
              )}

              {activeTab === 'scanner' && !activeScanQrId && (
                <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xl">
                  <h3 className="text-xl font-bold text-slate-900">Scan Emergency QR Tag</h3>
                  <p className="text-xs text-slate-600">
                    To test public emergency QR scanning, click "View Public Scan" on any created QR tag in the "QR Tags" tab.
                  </p>
                  <button
                    onClick={() => setActiveTab('qr')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md"
                  >
                    Go to QR Tags List
                  </button>
                </div>
              )}

              {activeTab === 'sos' && <SOSModule />}
              {activeTab === 'qr' && <QRManagement onScanQR={handleOpenScanner} />}
              {activeTab === 'medical' && <MedicalAndFamily />}
              {activeTab === 'directory' && <EmergencyDirectory />}
              {activeTab === 'shop' && <ShopAndWallet />}
              {activeTab === 'admin' && <AdminDashboard />}
            </>
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
            Powered by Node.js Architecture & Firestore Real-Time Database
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
