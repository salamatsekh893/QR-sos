import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  Heart,
  ShieldCheck,
  Hospital,
  User,
  MapPin,
  CheckCircle,
  Share2,
  FileText
} from 'lucide-react';
import { QRCodeTag, MedicalProfile } from '../types';
import {
  getQRCodeTag,
  getMedicalProfile,
  incrementQRScan,
  triggerSOSAlert
} from '../services/firestoreService';

interface QRScanPageProps {
  qrId: string;
  onBack: () => void;
}

export const QRScanPage: React.FC<QRScanPageProps> = ({ qrId, onBack }) => {
  const [tag, setTag] = useState<QRCodeTag | null>(null);
  const [medical, setMedical] = useState<MedicalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  useEffect(() => {
    async function loadQRData() {
      setLoading(true);
      const tagData = await getQRCodeTag(qrId);
      if (tagData) {
        setTag(tagData);
        incrementQRScan(qrId); // Increment scan counter on load
        const medData = await getMedicalProfile(tagData.userId);
        if (medData) {
          setMedical(medData);
        }
      }
      setLoading(false);
    }
    loadQRData();
  }, [qrId]);

  const handleBroadcastScanLocation = async () => {
    if (!tag) return;
    setBroadcastSent(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const sosData = {
          id: `SCAN_SOS_${Date.now()}`,
          userId: tag.userId,
          userName: `[QR Scanned] ${tag.assignedName}`,
          userPhone: tag.emergencyPhone,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          address: `Location broadcasted from Emergency QR Tag (${tag.title}) scan`,
          status: 'ACTIVE' as const,
          alertType: '1-Click SOS' as const,
          createdAt: new Date().toISOString(),
        };
        await triggerSOSAlert(sosData);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">Reading Emergency QR Identity Tag...</p>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-white space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-extrabold">Emergency Tag Not Found</h3>
        <p className="text-xs text-slate-400">
          The QR Tag ID <code className="text-red-400">{qrId}</code> was not found or has been deactivated by its owner.
        </p>
        <button
          onClick={onBack}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Control */}
      <button
        onClick={onBack}
        className="text-xs font-bold text-slate-600 hover:text-blue-700 flex items-center space-x-1"
      >
        <span>← Back to Dashboard</span>
      </button>

      {/* Main Public Emergency Card */}
      <div className="bg-white border-2 border-blue-600 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700" />

        {/* Emergency Card Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                EMERGENCY MEDICAL IDENTITY
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold">Tag #{tag.id}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{tag.assignedName}</h2>
            <p className="text-xs text-slate-600 font-mono font-bold mt-0.5">{tag.title} ({tag.qrType})</p>
          </div>

          {/* Blood Group Badge */}
          <div className="bg-blue-50 border-2 border-blue-600 px-4 py-3 rounded-2xl text-center shadow">
            <span className="text-[10px] text-blue-900 font-black uppercase block">Blood Group</span>
            <span className="text-2xl sm:text-3xl font-black text-red-600">{tag.bloodGroup || 'O+'}</span>
          </div>
        </div>

        {/* Instant Action Emergency Call Buttons */}
        <div className="my-6 space-y-3">
          <a
            href={`tel:${tag.emergencyPhone}`}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-black py-4 px-6 rounded-2xl text-base sm:text-lg flex items-center justify-center space-x-3 shadow-xl transition transform active:scale-95 border-2 border-yellow-400"
          >
            <PhoneCall className="w-6 h-6 animate-pulse text-yellow-300" />
            <span>CALL EMERGENCY CONTACT ({tag.emergencyPhone})</span>
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`https://wa.me/${tag.emergencyPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `🚨 EMERGENCY ALERT: I scanned the Emergency QR Tag of ${tag.assignedName}. Please contact immediately.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Emergency Alert</span>
            </a>

            <button
              onClick={handleBroadcastScanLocation}
              disabled={broadcastSent}
              className={`font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
                broadcastSent
                  ? 'bg-slate-100 text-emerald-800 border border-emerald-300'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black shadow'
              }`}
            >
              {broadcastSent ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>GPS Broadcasted to Family</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-blue-950" />
                  <span>Broadcast GPS Location to Family</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tag Notes */}
        {tag.notes && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 mb-6">
            <span className="font-bold text-blue-700 block mb-1">Emergency Instructions / Owner Notes:</span>
            <p className="leading-relaxed font-medium">{tag.notes}</p>
          </div>
        )}

        {/* Medical Profile Details */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Heart className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-sm text-slate-900">Verified Medical Profile</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Allergies:</span>
              <span className="font-bold text-slate-800">{medical?.allergies || 'None declared'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Chronic Diseases / Illness:</span>
              <span className="font-bold text-slate-800">{medical?.chronicDiseases || 'None declared'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Current Medications:</span>
              <span className="font-bold text-slate-800">{medical?.currentMedications || 'None declared'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Organ Donor Status:</span>
              <span className="font-black text-emerald-700">
                {medical?.organDonor ? 'Pledged Organ Donor ❤️' : 'Not Pledged'}
              </span>
            </div>
            {medical?.doctorName && (
              <div>
                <span className="text-slate-500 font-medium block">Doctor Contact:</span>
                <span className="font-bold text-slate-800">
                  {medical.doctorName} ({medical.doctorPhone || 'N/A'})
                </span>
              </div>
            )}
            {medical?.hospitalName && (
              <div>
                <span className="text-slate-500 font-medium block">Preferred Hospital:</span>
                <span className="font-bold text-slate-800">{medical.hospitalName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
