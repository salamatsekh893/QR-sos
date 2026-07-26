import React from 'react';
import { Building, ShieldAlert, PhoneCall, MapPin, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BranchAdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-950 border border-teal-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Building className="w-5 h-5 text-yellow-400" />
            <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              Regional Branch Command
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">District Branch Operations</h1>
          <p className="text-xs text-teal-100 mt-1">
            Regional emergency response coordination, local hospital directory management, and branch responder supervision.
          </p>
        </div>

        <div className="bg-teal-950/80 p-3 rounded-xl border border-teal-700/50 text-xs font-mono shrink-0">
          <div className="text-teal-200">Assigned Branch: Kolkata Metro North</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xl">
          <div className="text-xs font-bold text-slate-500 uppercase">District Active SOS</div>
          <div className="text-2xl font-black text-slate-900 mt-2">2 Cases</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xl">
          <div className="text-xs font-bold text-slate-500 uppercase">Local Hospitals Connected</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">18 Hospitals</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xl">
          <div className="text-xs font-bold text-slate-500 uppercase">Branch Responders</div>
          <div className="text-2xl font-black text-blue-600 mt-2">12 Active Units</div>
        </div>
      </div>
    </div>
  );
};
