import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShieldAlert,
  Navigation,
  MapPin,
  Phone,
  Check,
  Clock,
  CheckCircle,
  Activity,
  UserCheck,
  FileText,
  Filter,
  Map
} from 'lucide-react';
import { SOSAlert } from '../../types';
import { SOSService } from '../../services/SOSService';
import { useAuth } from '../../context/AuthContext';

export const EmergencyResponderDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'dispatch' | 'map' | 'history'>('feed');
  const [unitName, setUnitName] = useState<string>('Rapid Responder Unit 04');

  useEffect(() => {
    const unsub = SOSService.subscribeActiveAlerts((data) => setAlerts(data));
    return () => unsub();
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');
  const dispatchedAlerts = alerts.filter((a) => a.status === 'DISPATCHED');
  const resolvedAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  const handleDispatchUnit = async (alertId: string) => {
    const unit = prompt('Enter Assigned Responder Unit / Team Name:', unitName);
    if (!unit) return;
    try {
      await SOSService.updateStatus(alertId, 'DISPATCHED', `Unit Dispatched: ${unit}`);
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const notes = prompt('Enter Field Resolution Summary:', 'Victim attended on scene safely. Medical assistance provided.');
    try {
      await SOSService.updateStatus(alertId, 'RESOLVED', notes || 'Case resolved safely.');
    } catch (err) {
      console.error('Resolution error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Responder Top Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-yellow-600 border border-red-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Radio className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              Field Responder Command
            </span>
            <span className="text-xs text-red-100 font-mono">24/7 Rapid Incident Unit</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Emergency Responders Console</h1>
          <p className="text-xs text-red-100 mt-1">
            Real-time emergency distress stream, field unit dispatching, live GPS coordinate navigation, and resolution tracking.
          </p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-red-500/40 text-xs font-mono shrink-0">
          <div className="text-yellow-400 font-bold">Active Distress Cases: {activeAlerts.length}</div>
          <div className="text-white font-bold">Dispatched Teams: {dispatchedAlerts.length}</div>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-md space-x-1">
        <button
          onClick={() => setActiveSubTab('feed')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeSubTab === 'feed' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Live SOS Feed ({activeAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dispatch')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeSubTab === 'dispatch' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Dispatch Panel ({dispatchedAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('map')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeSubTab === 'map' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Incident Map</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition ${
            activeSubTab === 'history' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Response History ({resolvedAlerts.length})</span>
        </button>
      </div>

      {/* 1. LIVE SOS FEED */}
      {activeSubTab === 'feed' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
            <span>Active Emergency Distress Broadcast Stream</span>
          </h2>

          {activeAlerts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
              No active unassigned emergency distress signals. All clear on network.
            </div>
          ) : (
            activeAlerts.map((al) => (
              <div key={al.id} className="p-5 bg-red-50/90 border border-red-300 rounded-2xl shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                      CRITICAL SOS - {al.alertType}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{al.userName}</h3>
                    <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-red-600" />
                      <a href={`tel:${al.userPhone}`} className="hover:underline text-red-700">
                        {al.userPhone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${al.latitude},${al.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center space-x-1 shadow"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>GPS Directions</span>
                    </a>

                    <button
                      onClick={() => handleDispatchUnit(al.id)}
                      className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow"
                    >
                      Accept & Dispatch
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-red-200 text-xs font-mono text-slate-800 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{al.address}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. DISPATCH PANEL */}
      {activeSubTab === 'dispatch' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-yellow-600" />
            <span>Dispatched Responders Field Activity</span>
          </h2>

          {dispatchedAlerts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
              No active field dispatches currently in transit.
            </div>
          ) : (
            dispatchedAlerts.map((al) => (
              <div key={al.id} className="p-4 bg-yellow-50 border border-yellow-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{al.userName} ({al.userPhone})</div>
                  <div className="text-xs text-slate-600 mt-0.5">{al.address}</div>
                  {al.responderNotes && (
                    <div className="text-xs text-blue-800 font-mono mt-1 font-bold">{al.responderNotes}</div>
                  )}
                </div>

                <button
                  onClick={() => handleResolveAlert(al.id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center space-x-1 shadow shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Case Resolved</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. INCIDENT MAP */}
      {activeSubTab === 'map' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Map className="w-5 h-5 text-blue-600" />
            <span>Visual Incident Map & GPS Grid</span>
          </h2>

          <div className="bg-slate-900 p-8 rounded-2xl text-center text-white space-y-3">
            <MapPin className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-white">Live Field GPS Coordinates Grid</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              All active emergency signals automatically synchronize with Google Maps GPS API for real-time turn-by-turn field navigation.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              {alerts.map((a) => (
                <a
                  key={a.id}
                  href={`https://www.google.com/maps/dir/?api=1&destination=${a.latitude},${a.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{a.userName} ({a.latitude.toFixed(3)}, {a.longitude.toFixed(3)})</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. RESPONSE HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Resolved Emergency Incident Log</span>
          </h2>

          {resolvedAlerts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
              No resolved emergency cases recorded in history yet.
            </div>
          ) : (
            resolvedAlerts.map((al) => (
              <div key={al.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{al.userName} ({al.alertType})</span>
                  <span className="text-emerald-600">RESOLVED</span>
                </div>
                <div className="text-slate-600">{al.address}</div>
                {al.responderNotes && <div className="text-slate-500 font-mono italic">Notes: {al.responderNotes}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
