import React, { useState } from 'react';
import { Building2, QrCode, DollarSign, Package, TrendingUp, Wallet, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DistributorDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [payoutRequested, setPayoutRequested] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 border border-indigo-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Building2 className="w-5 h-5 text-yellow-400" />
            <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              Distributor Portal
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Distributor & Offline Sales Center</h1>
          <p className="text-xs text-blue-200 mt-1">
            Manage offline QR tag inventory, customer activation commission, and wallet payouts.
          </p>
        </div>

        <div className="bg-indigo-950/80 p-3 rounded-xl border border-indigo-700/50 text-xs text-right shrink-0">
          <div className="text-blue-300 font-bold">Earned Commission: <span className="text-emerald-400 font-black">₹18,000</span></div>
          <div className="text-blue-300 font-bold">QR Stickers Stock: <span className="text-yellow-300 font-black">550 Tags</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xl">
          <div className="text-xs font-bold text-slate-500 uppercase">Allocated Batches</div>
          <div className="text-2xl font-black text-slate-900 mt-2">1,000 Stickers</div>
          <p className="text-[10px] text-blue-600 mt-1">Batch #DIS_KOL_2026</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xl">
          <div className="text-xs font-bold text-slate-500 uppercase">Activated Customer Tags</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">450 Tags</div>
          <p className="text-[10px] text-emerald-600 mt-1">45% Conversion Rate</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xl">
          <div className="text-xs font-bold text-slate-500 uppercase">Commission Balance</div>
          <div className="text-2xl font-black text-blue-600 mt-2">₹18,000</div>
          <button
            onClick={() => setPayoutRequested(true)}
            disabled={payoutRequested}
            className="mt-3 bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-200 text-slate-950 text-xs font-black px-3 py-1.5 rounded-lg w-full transition"
          >
            {payoutRequested ? 'Payout Request Submitted' : 'Request Bank Withdrawal'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Recent Customer Activations</h3>
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
            <span>Ramesh Sharma (Vehicle Tag #TAG_88102)</span>
            <span className="font-bold text-emerald-600">+₹40 Commission Credited</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
            <span>Sunita Banerjee (Helmet Tag #TAG_88103)</span>
            <span className="font-bold text-emerald-600">+₹40 Commission Credited</span>
          </div>
        </div>
      </div>
    </div>
  );
};
