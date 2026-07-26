import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Car,
  User,
  Heart,
  Dog,
  Home,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QRCodeTag, QRType } from '../types';
import {
  createQRCodeTag,
  subscribeToUserQRCodes,
  deleteQRCodeTag
} from '../services/firestoreService';

interface QRManagementProps {
  onScanQR: (qrId: string) => void;
}

export const QRManagement: React.FC<QRManagementProps> = ({ onScanQR }) => {
  const { userProfile } = useAuth();
  const [tags, setTags] = useState<QRCodeTag[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>('My Emergency QR Tag');
  const [qrType, setQrType] = useState<QRType>('Personal');
  const [assignedName, setAssignedName] = useState<string>(userProfile?.fullName || 'John Doe');
  const [emergencyPhone, setEmergencyPhone] = useState<string>(userProfile?.phone || '+91 98765 43210');
  const [bloodGroup, setBloodGroup] = useState<string>(userProfile?.bloodGroup || 'O+');
  const [vehicleNo, setVehicleNo] = useState<string>('DL-01-AB-1234');
  const [notes, setNotes] = useState<string>('Please call emergency contact immediately if found or injured.');

  useEffect(() => {
    if (!userProfile) return;
    const unsubscribe = subscribeToUserQRCodes(userProfile.uid, (userTags) => {
      setTags(userTags);
    });
    return () => unsubscribe();
  }, [userProfile]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const qrId = `SL_${Date.now().toString().slice(-8)}`;
    const newTag: QRCodeTag = {
      id: qrId,
      userId: userProfile.uid,
      title,
      qrType,
      code: qrId,
      assignedName,
      bloodGroup,
      emergencyPhone,
      vehicleNo: qrType === 'Vehicle' || qrType === 'Helmet' ? vehicleNo : undefined,
      notes,
      isActive: true,
      scansCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await createQRCodeTag(newTag);
      setIsCreating(false);
      // Reset form defaults
      setTitle('My Emergency QR Tag');
    } catch (err) {
      console.error('Create QR Error:', err);
    }
  };

  const handleDelete = async (qrId: string) => {
    if (confirm('Are you sure you want to delete this Emergency QR Tag?')) {
      try {
        await deleteQRCodeTag(qrId);
      } catch (err) {
        console.error('Delete QR Error:', err);
      }
    }
  };

  const handleCopyLink = (qrId: string) => {
    const url = `${window.location.origin}/?qr=${qrId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(qrId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getQRTypeIcon = (type: QRType) => {
    switch (type) {
      case 'Vehicle':
      case 'Helmet':
        return <Car className="w-5 h-5 text-blue-500" />;
      case 'Senior Citizen':
      case 'Child':
      case 'Women Safety':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'Pet':
        return <Dog className="w-5 h-5 text-amber-500" />;
      case 'Home':
        return <Home className="w-5 h-5 text-emerald-500" />;
      default:
        return <User className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 border border-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <QrCode className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-extrabold text-white">Dynamic Emergency QR Generator</h2>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
            Create scannable Emergency QR tags for vehicles, helmets, children, senior citizens, bags, pets, and homes. Anyone scanning the QR can view medical info and call emergency contacts instantly.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition shrink-0"
        >
          <Plus className="w-4 h-4 text-blue-950" />
          <span>{isCreating ? 'Cancel Creation' : 'Create New QR Tag'}</span>
        </button>
      </div>

      {/* Creation Modal / Inline Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateTag}
          className="bg-white border-2 border-blue-600/40 rounded-2xl p-6 sm:p-8 text-slate-900 space-y-6 shadow-2xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Configure New Emergency QR Identity Tag</span>
            </h3>
            <span className="text-xs text-blue-600 font-mono font-bold">Real-time Firestore Record</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tag Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                placeholder="e.g. Helmet Emergency Sticker"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Tag Type</label>
              <select
                value={qrType}
                onChange={(e) => setQrType(e.target.value as QRType)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="Personal">Personal Identity Tag</option>
                <option value="Vehicle">Vehicle / Car Sticker</option>
                <option value="Helmet">Bike Helmet Sticker</option>
                <option value="Child">Child Safety Tag</option>
                <option value="Senior Citizen">Senior Citizen Card</option>
                <option value="Women Safety">Women Safety Tag</option>
                <option value="Pet">Pet Collar Tag</option>
                <option value="Home">Home / Door QR</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Assigned Name</label>
              <input
                type="text"
                value={assignedName}
                onChange={(e) => setAssignedName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Emergency Phone Number</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {(qrType === 'Vehicle' || qrType === 'Helmet') && (
              <div>
                <label className="block text-slate-600 font-medium mb-1">Vehicle / RC Number</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1 text-xs">Emergency Instructions / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-lg"
            >
              Generate & Save QR Tag
            </button>
          </div>
        </form>
      )}

      {/* QR Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tags.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xl">
            <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-3 opacity-60" />
            <p className="font-extrabold text-slate-900 text-base">No Emergency QR Tags Created Yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click "Create New QR Tag" above to register your first emergency QR identity card or vehicle sticker.
            </p>
          </div>
        ) : (
          tags.map((tag) => {
            const scanUrl = `${window.location.origin}/?qr=${tag.id}`;
            return (
              <div
                key={tag.id}
                className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-slate-900 shadow-xl flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                        {getQRTypeIcon(tag.qrType)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition">
                          {tag.title}
                        </h4>
                        <span className="text-[11px] text-slate-500 font-mono font-bold">{tag.qrType}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-black">
                      {tag.scansCount} Scans
                    </span>
                  </div>

                  {/* QR Canvas Display */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center my-4 shadow-inner">
                    <QRCodeSVG
                      value={scanUrl}
                      size={140}
                      level="H"
                      includeMargin={true}
                    />
                    <div className="mt-2 text-[10px] font-mono font-extrabold text-blue-900 tracking-wider">
                      TAG ID: {tag.id}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Name:</span>
                      <span className="font-bold text-slate-900">{tag.assignedName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Emergency Contact:</span>
                      <span className="font-mono text-blue-600 font-bold">{tag.emergencyPhone}</span>
                    </div>
                    {tag.bloodGroup && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Blood Group:</span>
                        <span className="font-black text-red-600">{tag.bloodGroup}</span>
                      </div>
                    )}
                    {tag.vehicleNo && (
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Vehicle No:</span>
                        <span className="font-mono text-slate-900 font-bold">{tag.vehicleNo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onScanQR(tag.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2.5 rounded-xl flex items-center justify-center space-x-1 shadow transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Public Scan</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(tag.id)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition"
                    title="Copy QR Scan URL"
                  >
                    {copiedId === tag.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl border border-slate-200 transition"
                    title="Delete QR Tag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
