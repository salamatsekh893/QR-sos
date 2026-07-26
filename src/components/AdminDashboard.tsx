import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldAlert,
  QrCode,
  Users,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  MapPin,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react';
import { SOSAlert } from '../types';
import { subscribeToActiveSOSAlerts } from '../services/firestoreService';

export const AdminDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);

  useEffect(() => {
    const unsub = subscribeToActiveSOSAlerts((data) => setAlerts(data));
    return () => unsub();
  }, []);

  const activeCases = alerts.filter((a) => a.status === 'ACTIVE').length;
  const resolvedCases = alerts.filter((a) => a.status === 'RESOLVED').length;

  const exportReport = (reportType: string) => {
    const content = `SAFE LIFE Enterprise Platform Report - ${reportType}\nGenerated: ${new Date().toLocaleString()}\nActive Cases: ${activeCases}\nResolved Cases: ${resolvedCases}\nTotal Cases Logged: ${alerts.length}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeLife_${reportType.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 border border-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-extrabold">Enterprise Admin & Responders Control Center</h2>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm">
            Real-time Firestore database synchronization monitoring active SOS distress signals, QR identity scans, franchise commissions, and emergency dispatch logs across India.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => exportReport('SOS Emergency Audit Log')}
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5 text-blue-950" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active SOS Alerts</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <ShieldAlert className="w-5 h-5 animate-pulse text-blue-700" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">{activeCases}</div>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Live Responders Dispatched</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Emergency QRs</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <QrCode className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">1,482</div>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Active Scannable Tags</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Resolved Cases</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-800" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">{resolvedCases}</div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">Successfully Assisted</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Monthly Revenue</span>
            <div className="p-2 bg-yellow-100 text-yellow-800 rounded-xl">
              <DollarSign className="w-5 h-5 text-yellow-800" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">₹2,84,500</div>
          <p className="text-[11px] text-yellow-800 font-bold mt-1">Subscriptions & Products</p>
        </div>
      </div>

      {/* Live SOS Emergency Case Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>National Responders Emergency Case Stream</span>
          </h3>
          <span className="text-xs font-mono text-slate-500 font-bold">Live Firestore Listener</span>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-center py-10 text-slate-500 text-xs font-medium">No emergency cases logged in Firestore yet</p>
          ) : (
            alerts.map((al) => (
              <div
                key={al.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 text-sm">{al.userName}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      al.status === 'ACTIVE' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {al.status}
                    </span>
                  </div>
                  <div className="text-slate-600 font-mono font-medium mt-1 flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{al.address}</span>
                  </div>
                </div>

                <div className="text-right text-slate-600 font-mono text-[11px]">
                  <div>{new Date(al.createdAt).toLocaleString()}</div>
                  <div className="text-blue-700 font-black">{al.userPhone}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
