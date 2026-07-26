import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  UserX,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole, AccountStatus } from '../../types';
import { UserService } from '../../services/UserService';
import { useAuth } from '../../context/AuthContext';

export const UserManagement: React.FC = () => {
  const { userProfile: currentUserProfile, updateRole: updateAuthRole } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = UserService.subscribeAllUsers((liveUsers) => {
      // Ensure current user is in list or fallback
      setUsers(liveUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole, currentStatus: AccountStatus = 'ACTIVE') => {
    try {
      await UserService.updateRoleAndStatus(userId, newRole, currentStatus);
      if (currentUserProfile?.uid === userId) {
        await updateAuthRole(newRole);
      }
      showToast(`User role updated to ${newRole} in Firestore.`);
    } catch (err) {
      console.error('Error updating user role:', err);
      showToast('Failed to save role update to Firestore.');
    }
  };

  const handleStatusChange = async (userId: string, currentRole: UserRole, newStatus: AccountStatus) => {
    try {
      await UserService.updateRoleAndStatus(userId, currentRole, newStatus);
      showToast(`Account status set to ${newStatus} in Firestore.`);
    } catch (err) {
      console.error('Error updating user status:', err);
      showToast('Failed to save account status to Firestore.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (u.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || phoneMatch;

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || (u.accountStatus || 'ACTIVE') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const availableRoles: UserRole[] = [
    'Customer',
    'Distributor',
    'Branch Admin',
    'Emergency Responder',
    'Super Admin',
  ];

  const getStatusBadge = (status: AccountStatus = 'ACTIVE') => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>ACTIVE</span>
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-300">
            <UserX className="w-3 h-3 text-slate-500" />
            <span>INACTIVE</span>
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center space-x-1 bg-red-100 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-300 animate-pulse">
            <AlertOctagon className="w-3 h-3 text-red-600" />
            <span>SUSPENDED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
            <span>ACTIVE</span>
          </span>
        );
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Emergency Responder':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'Branch Admin':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Distributor':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Customer':
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-6 text-slate-900 relative">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Super Admin User Management</h2>
            <span className="bg-yellow-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
              Restricted Module
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time control over all registered platform accounts in Firestore database. Modify roles and manage account status instantly.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Users className="w-4 h-4 text-slate-500" />
          <span>Total Registered: {users.length}</span>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name, Email, or Mobile..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs font-medium focus:ring-2 focus:ring-yellow-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-medium flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" />
          <span>Synchronizing live users from Firestore...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs font-medium">
          No users matching the search criteria were found in Firestore.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Mobile & Email</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((u) => {
                const currentStatus: AccountStatus = u.accountStatus || 'ACTIVE';
                const createdDateFormatted = u.createdAt
                  ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A';

                return (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-yellow-400 font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
                          {(u.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{u.fullName || 'Unnamed User'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">UID: {u.uid.slice(0, 10)}...</div>
                        </div>
                      </div>
                    </td>

                    {/* Mobile & Email */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900">{u.phone || 'No Phone'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{u.email || 'No Email'}</span>
                      </div>
                    </td>

                    {/* Current Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block font-black text-[10px] px-2.5 py-0.5 rounded-full border uppercase shadow-xs ${getRoleBadgeColor(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(currentStatus)}</td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium text-[11px]">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{createdDateFormatted}</span>
                      </div>
                    </td>

                    {/* Super Admin Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Change Role Selector */}
                        <div className="flex items-center space-x-1">
                          <span className="text-[10px] font-bold text-slate-400">Role:</span>
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u.uid, e.target.value as UserRole, currentStatus)
                            }
                            className="bg-white border border-slate-300 rounded-lg text-[11px] font-bold px-2 py-1 text-slate-800 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                          >
                            {availableRoles.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                          {currentStatus !== 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(u.uid, u.role, 'ACTIVE')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded-md transition shadow-xs"
                              title="Activate User Account"
                            >
                              Activate
                            </button>
                          )}

                          {currentStatus !== 'INACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(u.uid, u.role, 'INACTIVE')}
                              className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-[10px] px-2 py-1 rounded-md transition shadow-xs"
                              title="Deactivate User Account"
                            >
                              Deactivate
                            </button>
                          )}

                          {currentStatus !== 'SUSPENDED' && (
                            <button
                              onClick={() => handleStatusChange(u.uid, u.role, 'SUSPENDED')}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] px-2 py-1 rounded-md transition shadow-xs"
                              title="Suspend User Account"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
