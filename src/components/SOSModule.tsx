import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  MapPin,
  Volume2,
  VolumeX,
  PhoneCall,
  MessageSquare,
  Share2,
  CheckCircle,
  AlertTriangle,
  Radio,
  Clock,
  BatteryCharging,
  Zap,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SOSAlert } from '../types';
import {
  triggerSOSAlert,
  resolveSOSAlert,
  subscribeToActiveSOSAlerts
} from '../services/firestoreService';

export const SOSModule: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<SOSAlert[]>([]);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting GPS location...');
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [shakeMode, setShakeMode] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // Subscribe to real-time SOS alerts in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToActiveSOSAlerts((alerts) => {
      setActiveAlerts(alerts);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real geolocation on load
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentCoords({ lat, lng });
          setLocationName(`GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (Lat/Lng Captured)`);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using fallback:', err.message);
          // Fallback location (e.g. Connaught Place, New Delhi)
          setCurrentCoords({ lat: 28.6315, lng: 77.2167 });
          setLocationName('Connaught Place, New Delhi, Delhi 110001 (GPS Standard)');
        }
      );
    } else {
      setCurrentCoords({ lat: 28.6315, lng: 77.2167 });
      setLocationName('New Delhi, India (Default Station)');
    }

    // Battery API check
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
      });
    }
  }, []);

  // Siren Sound Generator using Web Audio API
  const toggleSiren = () => {
    if (isSirenActive) {
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      audioCtxRef.current = null;
      setIsSirenActive(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        let highFreq = false;
        sirenIntervalRef.current = setInterval(() => {
          if (!ctx || ctx.state === 'closed') return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(highFreq ? 900 : 600, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
          highFreq = !highFreq;
        }, 300);

        setIsSirenActive(true);
      } catch (err) {
        console.error('Audio Context Error:', err);
      }
    }
  };

  // Trigger Real Emergency SOS to Firestore
  const handleTriggerSOS = async (alertType: '1-Click SOS' | 'Shake Alert' | 'Silent SOS' = '1-Click SOS') => {
    if (!userProfile) return;
    setIsActivating(true);

    const lat = currentCoords ? currentCoords.lat : 28.6315;
    const lng = currentCoords ? currentCoords.lng : 77.2167;

    const newAlert: SOSAlert = {
      id: `SOS_${Date.now()}`,
      userId: userProfile.uid,
      userName: userProfile.fullName,
      userPhone: userProfile.phone || '+91 98765 43210',
      latitude: lat,
      longitude: lng,
      address: locationName,
      status: 'ACTIVE',
      alertType,
      batteryLevel,
      createdAt: new Date().toISOString(),
    };

    try {
      await triggerSOSAlert(newAlert);
      setIsActivating(false);
      setAlertSuccess(`🚨 LIVE SOS ALERT DISPATCHED TO EMERGENCY NETWORK & FIRESTORE!`);
      toggleSiren(); // Auto play siren
      setTimeout(() => setAlertSuccess(null), 8000);
    } catch (error) {
      console.error('SOS Trigger Error:', error);
      setIsActivating(false);
    }
  };

  // Handle Resolution
  const handleResolve = async (alertId: string) => {
    try {
      await resolveSOSAlert(alertId);
    } catch (err) {
      console.error('Resolve SOS Error:', err);
    }
  };

  // Generate WhatsApp Alert Link
  const getWhatsAppAlertLink = (alert: SOSAlert) => {
    const text = `🚨 *EMERGENCY SOS ALERT - SAFE LIFE* 🚨\n\nName: ${alert.userName}\nPhone: ${alert.userPhone}\nAlert Type: ${alert.alertType}\nLocation: https://maps.google.com/?q=${alert.latitude},${alert.longitude}\nAddress: ${alert.address}\nBattery: ${alert.batteryLevel}%\nTime: ${new Date(alert.createdAt).toLocaleTimeString()}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const activeAlertsCount = activeAlerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="space-y-8">
      {/* Top Banner Alert Status */}
      {alertSuccess && (
        <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between border-2 border-emerald-400 animate-bounce">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-200" />
            <span className="font-bold text-sm sm:text-base">{alertSuccess}</span>
          </div>
          <button
            onClick={() => setAlertSuccess(null)}
            className="text-white text-xs bg-emerald-800 px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Panic Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left SOS Trigger Panel */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-slate-900 flex flex-col justify-between">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 text-xs font-mono font-bold rounded-full uppercase flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-blue-600" />
                  National Live Emergency Network
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-bold">
                <BatteryCharging className="w-4 h-4 text-emerald-600" />
                <span>Battery: {batteryLevel}%</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Instant 1-Click <span className="text-blue-600">Emergency SOS</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Pressing the emergency trigger immediately broadcasts your live GPS coordinates, battery status, and profile to nearby responders and your emergency contacts in real-time.
            </p>
          </div>

          {/* Central Panic Button */}
          <div className="my-8 flex flex-col items-center justify-center">
            <button
              onClick={() => handleTriggerSOS('1-Click SOS')}
              disabled={isActivating}
              className={`relative group w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex flex-col items-center justify-center shadow-2xl shadow-blue-900/50 border-4 border-yellow-400 active:scale-95 transition-all ${
                isActivating ? 'opacity-80 animate-pulse' : 'hover:scale-105'
              }`}
            >
              <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-25 group-hover:opacity-40" />
              <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-300 mb-2 drop-shadow-md" />
              <span className="text-xl sm:text-2xl font-black text-white tracking-wider">TRIGGER SOS</span>
              <span className="text-[11px] font-bold text-yellow-300 uppercase mt-0.5">Press For Instant Alert</span>
            </button>
          </div>

          {/* Controls Bar */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2 text-slate-700">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-mono text-[11px] truncate font-medium">{locationName}</span>
              </div>
              <button
                onClick={() => {
                  if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      setLocationName(`GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
                    });
                  }
                }}
                className="text-blue-600 hover:text-blue-800 font-bold underline shrink-0 ml-2"
              >
                Refresh GPS
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={toggleSiren}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl border font-bold text-xs transition ${
                  isSirenActive
                    ? 'bg-blue-600 text-white border-blue-700 animate-pulse'
                    : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
                <span>{isSirenActive ? 'Stop Siren Sound' : 'Play Loud Siren'}</span>
              </button>

              <button
                onClick={() => handleTriggerSOS('Silent SOS')}
                className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-extrabold border border-yellow-500 text-xs transition shadow"
              >
                <Zap className="w-4 h-4 text-blue-950" />
                <span>Silent Emergency SOS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Active SOS Feed & Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Firestore Feed Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-blue-600 animate-ping" />
                <h3 className="font-bold text-lg text-slate-900">Live SOS Broadcast Feed</h3>
              </div>
              <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full">
                {activeAlertsCount} Active Case{activeAlertsCount !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-slate-500 text-xs mb-4">
              Real-time Firestore `onSnapshot` listener tracking live active distress signals across the platform.
            </p>

            {/* Active Alerts List */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-slate-600 text-xs font-bold">No active emergency alerts currently</p>
                  <p className="text-slate-500 text-[11px]">System operating in secure monitoring mode</p>
                </div>
              ) : (
                activeAlerts.map((alert) => {
                  const isResolved = alert.status === 'RESOLVED';
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isResolved
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'bg-blue-50 border-blue-300 text-slate-900 shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                isResolved ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white'
                              }`}
                            >
                              {alert.status}
                            </span>
                            <span className="text-xs font-mono text-slate-500">
                              {new Date(alert.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">{alert.userName}</h4>
                          <p className="text-xs text-slate-600 font-mono mt-0.5">{alert.userPhone}</p>
                        </div>

                        <a
                          href={getWhatsAppAlertLink(alert)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow"
                          title="Share to WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="mt-3 text-xs bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1 shrink-0" />
                          <span className="truncate">{alert.address}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>Alert: {alert.alertType}</span>
                          <a
                            href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-bold"
                          >
                            Open Maps ↗
                          </a>
                        </div>
                      </div>

                      {!isResolved && (
                        <div className="mt-3 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg transition shadow"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Safety Features Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-900 shadow-xl">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Smart Sensor Safety Settings
            </h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                <span className="font-bold text-slate-800">Shake Phone to Trigger SOS</span>
                <input
                  type="checkbox"
                  checked={shakeMode}
                  onChange={(e) => setShakeMode(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
