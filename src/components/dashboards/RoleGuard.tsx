import React from 'react';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  onFallbackToCustomer?: () => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  onFallbackToCustomer,
}) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500 font-medium text-xs">
        Verifying user credentials and role permissions...
      </div>
    );
  }

  const userRole = userProfile?.role || 'Customer';
  const status = userProfile?.accountStatus || 'ACTIVE';

  if (status === 'SUSPENDED' || status === 'INACTIVE') {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white border-2 border-red-500 rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
            Account {status}
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">
            Access Suspended by Super Admin
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Your account status is currently <strong className="text-red-600 uppercase">{status}</strong>. Please contact the platform Super Administrator or Support to restore full access.
          </p>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white border-2 border-red-300 rounded-2xl p-8 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
            Access Restricted
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">Protected Area</h2>
          <p className="text-xs text-slate-600 mt-1">
            Your current account role (<strong className="text-red-600 uppercase">{userRole}</strong>) does not have authorization to view this section.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 font-mono">
          Required Role: {allowedRoles.join(' OR ')}
        </div>

        {onFallbackToCustomer && (
          <button
            onClick={onFallbackToCustomer}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Customer Safety Portal</span>
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
