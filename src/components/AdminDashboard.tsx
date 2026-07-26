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
  Building,
  Navigation,
  Phone,
  Radio,
  UserCheck,
  Shield,
  Filter,
  Check
} from 'lucide-react';
import { SOSAlert, UserRole } from '../types';
import { subscribeToActiveSOSAlerts, updateSOSAlertStatus } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { userProfile, updateRole } = useAuth();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DISPATCHED' | 'RESOLVED'>('ALL');
  const [dispatchUnitName, setDispatchUnitName] = useState<string>('Ambulance 108 - Rapid Unit 04');
  const [activeTab, setActiveTab] = useState<'dispatch' | 'admin' | 'distributor'>('dispatch');

  useEffect(() => {
    const unsub = subscribeToActiveSOSAlerts((data) => setAlerts(data));
    return () => unsub();
  }, []);

  const activeCases = alerts.filter((a) => a.status === 'ACTIVE').length;
  const dispatchedCases = alerts.filter((a) => a.status === 'DISPATCHED').length;
  const resolvedCases = alerts.filter((a) => a.status === 'RESOLVED').length;

  const filteredAlerts = alerts.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const handleDispatch = async (alertId: string) => {
    const unit = prompt('Enter Dispatch Unit / Responder Name:', dispatchUnitName);
    if (!unit) return;
    try {
      await updateSOSAlertStatus(alertId, 'DISPATCHED', `Dispatched Unit: ${unit}`);
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  const handleResolve = async (alertId: string) => {
    const notes = prompt('Enter Case Resolution Summary / Notes:', 'Victim safely assisted on scene by emergency team.');
    try {
      await updateSOSAlertStatus(alertId, 'RESOLVED', notes || 'Case closed safely.');
    } catch (err) {
      console.error('Resolve error:', err);
    }
  };

  const exportReport = (reportType: string) => {
    let content = `========================================================\n`;
    content += `SAFE LIFE ENTERPRISE EMERGENCY PLATFORM AUDIT REPORT\n`;
    content += `Report Type: ${reportType}\n`;
    content += `Timestamp: ${new Date().toLocaleString()}\n`;
    content += `========================================================\n\n`;
    content += `SUMMARY METRICS:\n`;
    content += `- Total Cases Logged: ${alerts.length}\n`;
    content += `- Active SOS Alerts: ${activeCases}\n`;
    content += `- Dispatched Responders: ${dispatchedCases}\n`;
    content += `- Resolved Emergency Cases: ${resolvedCases}\n\n`;
    content += `DETAILED CASE LOGS:\n`;
    alerts.forEach((a, index) => {
      content += `${index + 1}. [ID: ${a.id}] [Status: ${a.status}] [Type: ${a.alertType}]\n`;
      content += `   Victim Name: ${a.userName} | Phone: ${a.userPhone}\n`;
      content += `   Address: ${a.address}\n`;
      content += `   Coordinates: Lat ${a.latitude}, Lng ${a.longitude}\n`;
      content += `   Created: ${new Date(a.createdAt).toLocaleString()}\n`;
      if (a.responderNotes) content += `   Notes: ${a.responderNotes}\n`;
      content += `--------------------------------------------------------\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeLife_Emergency_Audit_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 border border-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-extrabold">National Emergency Command & Responders Panel</h2>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
            Real-time Firestore sync managing live SOS distress signals, 1-click GPS field navigation, responder unit dispatching, and national helpline operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => exportReport('SOS Emergency Audit Log')}
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 text-xs font-black px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow active:scale-95 transition"
          >
            <Download className="w-4 h-4 text-blue-950" />
            <span>Export Incident Audit Log</span>
          </button>
        </div>
      </div>

      {/* Role Panel Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-md">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition ${
              activeTab === 'dispatch'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Responders Field Dispatch Feed</span>
            {activeCases > 0 && (
              <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {activeCases}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Command Center & Users</span>
          </button>

          <button
            onClick={() => setActiveTab('distributor')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition ${
              activeTab === 'distributor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Distributor & Franchise Wallet</span>
          </button>
        </div>

        {/* Current Active Role Indicator */}
        <div className="flex items-center space-x-2 text-xs px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-500">Active Role:</span>
          <span className="font-mono font-black text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
            {userProfile?.role || 'Super Admin'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Distress Signals</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <ShieldAlert className="w-5 h-5 animate-pulse text-blue-700" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">{activeCases}</div>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Requires Emergency Response</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Dispatched Units</span>
            <div className="p-2 bg-yellow-100 text-yellow-800 rounded-xl">
              <Radio className="w-5 h-5 text-yellow-800" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">{dispatchedCases}</div>
          <p className="text-[11px] text-yellow-800 font-bold mt-1">Units In Transit / On Scene</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Resolved Emergency Cases</span>
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-800" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">{resolvedCases}</div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">Safely Assisted</p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-slate-900 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Registered QR Tags</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <QrCode className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">1,482</div>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Active Scannable Tags</p>
        </div>
      </div>

      {/* PANEL 1: FIRST RESPONDERS FIELD DISPATCH FEED */}
      {activeTab === 'dispatch' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
                <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
                <span>Live Emergency Dispatch Stream</span>
              </h3>
              <p className="text-xs text-slate-500">
                1-Click dispatch units, navigate to victim's coordinates, and call emergency contacts
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
              {(['ALL', 'ACTIVE', 'DISPATCHED', 'RESOLVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition font-extrabold ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Cards List */}
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs font-medium">
                No emergency cases matching filter "{statusFilter}"
              </div>
            ) : (
              filteredAlerts.map((al) => {
                const isActive = al.status === 'ACTIVE';
                const isDispatched = al.status === 'DISPATCHED';
                const isResolved = al.status === 'RESOLVED';

                return (
                  <div
                    key={al.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-blue-50/80 border-blue-400 shadow-lg'
                        : isDispatched
                        ? 'bg-yellow-50/80 border-yellow-400 shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Victim Info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                              isActive
                                ? 'bg-blue-600 text-white animate-pulse'
                                : isDispatched
                                ? 'bg-yellow-400 text-slate-950 font-black'
                                : 'bg-slate-300 text-slate-700'
                            }`}
                          >
                            {al.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {new Date(al.createdAt).toLocaleString()}
                          </span>
                          <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            {al.alertType}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 pt-1">
                          <h4 className="text-base font-black text-slate-900">{al.userName}</h4>
                          <a
                            href={`tel:${al.userPhone}`}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1"
                          >
                            <Phone className="w-3.5 h-3.5 text-blue-700" />
                            <span>{al.userPhone}</span>
                          </a>
                        </div>

                        <div className="flex items-center space-x-1.5 text-xs text-slate-700 pt-1 font-mono">
                          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-bold">{al.address}</span>
                        </div>

                        {al.responderNotes && (
                          <div className="mt-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono">
                            <strong className="text-blue-700">Responder Note:</strong> {al.responderNotes}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Live Google Maps Navigation Link */}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${al.latitude},${al.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Navigate GPS ↗</span>
                        </a>

                        {isActive && (
                          <button
                            onClick={() => handleDispatch(al.id)}
                            className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 text-xs font-black px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow"
                          >
                            <Radio className="w-4 h-4 text-blue-950" />
                            <span>Dispatch Team</span>
                          </button>
                        )}

                        {!isResolved && (
                          <button
                            onClick={() => handleResolve(al.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 shadow"
                          >
                            <Check className="w-4 h-4" />
                            <span>Mark Resolved</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* PANEL 2: COMMAND CENTER & USERS */}
      {activeTab === 'admin' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-xl space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>National System Configuration & User Roles</span>
            </h3>
            <p className="text-xs text-slate-500">
              Manage application permissions, role distribution, and system operational parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Current User Account</h4>
              <p className="text-xs text-slate-600">Email: {userProfile?.email || 'salamatsekh405@gmail.com'}</p>
              <p className="text-xs text-slate-600">Name: {userProfile?.fullName || 'Salamat Sekh'}</p>
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500">Assigned Role: </span>
                <span className="bg-yellow-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded">
                  {userProfile?.role || 'Super Admin'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Switch Operational Role</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['Customer', 'Emergency Responder', 'Super Admin', 'Distributor'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => updateRole(r)}
                    className={`p-2.5 rounded-xl text-xs font-extrabold border transition ${
                      userProfile?.role === r
                        ? 'bg-blue-600 text-white border-blue-700 shadow'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 3: DISTRIBUTOR & FRANCHISE WALLET */}
      {activeTab === 'distributor' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-xl space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>Franchise & Distributor Earnings Center</span>
            </h3>
            <p className="text-xs text-slate-500">
              Track offline QR sticker distribution sales, commission percentages, and payout history.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-bold">Total QR Tags Sold</div>
              <div className="text-2xl font-black text-slate-900 mt-1">450 Tags</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-bold">Commission Rate</div>
              <div className="text-2xl font-black text-blue-600 mt-1">20% Per Tag</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-bold">Earned Balance</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">₹18,000</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

