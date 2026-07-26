import React, { useState } from 'react';
import {
  ShieldAlert,
  QrCode,
  PhoneCall,
  UserCheck,
  Building2,
  Wallet,
  ShoppingBag,
  Activity,
  HeartPulse,
  LogOut,
  Shield,
  Menu,
  X,
  User,
  ChevronRight,
  Flame,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSOSCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeSOSCount,
}) => {
  const { userProfile, signInWithGoogle, signOut, updateRole } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { id: 'sos', label: 'Live Emergency SOS', icon: ShieldAlert, badge: activeSOSCount, desc: 'Instant panic alert & GPS broadcast' },
    { id: 'qr', label: 'Emergency QR Tags', icon: QrCode, desc: 'Scannable vehicle & helmet tags' },
    { id: 'medical', label: 'Medical & Family Profile', icon: HeartPulse, desc: 'Blood group, allergies & contacts' },
    { id: 'directory', label: 'Helpline Directory', icon: PhoneCall, desc: '24/7 National police, hospital & rescue' },
    { id: 'shop', label: 'Safety Shop & Wallet', icon: ShoppingBag, desc: 'Buy QR stickers & cashback wallet' },
    { id: 'admin', label: 'Responders & Analytics', icon: Activity, desc: 'Enterprise live case dispatch feed' },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
        {/* Top Banner */}
        <div className="bg-blue-700 px-3 sm:px-4 py-1.5 text-xs text-white font-medium flex items-center justify-between border-b border-blue-600">
          <div className="flex items-center space-x-2 truncate">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
            <span className="truncate text-[11px] sm:text-xs">India's Emergency QR & Live Safety Ecosystem • 24/7 National Dispatch Network</span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 shrink-0">
            <span>Helpline: <strong className="text-yellow-300">112</strong> / <strong className="text-yellow-300">108</strong></span>
            <span className="opacity-90 bg-yellow-400 text-slate-900 font-black px-2 py-0.5 rounded text-[10px]">National Emergency Portal</span>
          </div>
        </div>

        {/* Main Navbar Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            
            {/* Left: 3-Line Menu (Hamburger Button) + Brand Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* 3-Line Menu Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-yellow-300 border border-blue-600 transition shadow-md active:scale-95 flex items-center justify-center group"
                aria-label="Open App Menu"
                title="Open 3-Line Menu Drawer"
              >
                <Menu className="w-6 h-6 text-yellow-300 group-hover:scale-110 transition-transform" />
              </button>

              {/* Brand Logo */}
              <div
                onClick={() => setActiveTab('sos')}
                className="flex items-center space-x-2.5 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/50 border border-yellow-400/50 group-hover:scale-105 transition-transform shrink-0">
                  <Shield className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-black text-lg sm:text-xl tracking-tight text-white">SAFE<span className="text-yellow-400">LIFE</span></span>
                    <span className="bg-yellow-400 text-slate-950 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Plus</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium hidden xs:block">Emergency QR & Live Safety Platform</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-yellow-400 text-blue-950 shadow-md font-black'
                        : 'text-blue-100 hover:text-white hover:bg-blue-800/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Quick Scanner Launcher */}
              <button
                onClick={() => setActiveTab('scanner')}
                className="flex items-center space-x-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-extrabold px-3 py-2 rounded-xl text-xs transition shadow-md active:scale-95"
              >
                <QrCode className="w-4 h-4 text-blue-950" />
                <span className="hidden sm:inline">Scan QR</span>
              </button>

              {/* User Profile / Login */}
              {userProfile ? (
                <div className="flex items-center space-x-2 border-l border-blue-800 pl-2 sm:pl-3">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-extrabold text-white truncate max-w-[120px]">{userProfile.fullName}</div>
                    <div className="text-[10px] text-yellow-300 font-mono font-bold">{userProfile.role}</div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    title="Sign Out"
                    className="p-2 text-blue-200 hover:text-yellow-300 hover:bg-blue-800 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-950 text-xs font-black px-3 py-2 rounded-xl shadow transition"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Bar */}
        <div className="lg:hidden flex overflow-x-auto border-t border-blue-800 px-2 py-1.5 space-x-1 text-xs bg-blue-950 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${
                  isActive ? 'bg-yellow-400 text-blue-950 shadow' : 'text-blue-200 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Slide-out Sidebar Drawer (Native Android/iOS Mobile App Style) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dark Backdrop Overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fade-in"
          />

          {/* Drawer Content */}
          <div className="relative w-80 sm:w-88 max-w-[85vw] bg-gradient-to-b from-blue-900 via-blue-950 to-slate-950 border-r border-blue-700/60 shadow-2xl flex flex-col h-full text-white z-50 animate-slide-in">
            {/* Drawer Top Header */}
            <div className="p-5 bg-blue-950 border-b border-blue-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border border-yellow-400/50 shadow-md">
                  <Shield className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-black text-lg text-white">SAFE<span className="text-yellow-400">LIFE</span></span>
                    <span className="bg-yellow-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Plus</span>
                  </div>
                  <p className="text-[11px] text-blue-300 font-mono">India's Live Emergency App</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-blue-200 hover:text-white border border-blue-600 transition"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card in Drawer */}
            <div className="p-4 mx-4 mt-4 bg-blue-900/60 border border-blue-700/50 rounded-2xl shadow-inner">
              {userProfile ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-yellow-400 text-blue-950 flex items-center justify-center font-black text-lg shadow">
                      {userProfile.fullName ? userProfile.fullName.charAt(0) : 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-extrabold text-sm text-white truncate">{userProfile.fullName}</div>
                      <div className="text-xs text-blue-200 truncate">{userProfile.email}</div>
                      <div className="mt-1 inline-block bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        {userProfile.role}
                      </div>
                    </div>
                  </div>

                  {/* Role Switcher inside Drawer */}
                  <div className="pt-2 border-t border-blue-800/80">
                    <div className="text-[11px] font-bold text-blue-300 mb-1.5">Switch App Role:</div>
                    <div className="grid grid-cols-3 gap-1 bg-blue-950 p-1 rounded-xl border border-blue-800">
                      {(['Customer', 'Super Admin', 'Emergency Responder'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => updateRole(r)}
                          className={`py-1 rounded-lg text-[10px] font-extrabold transition truncate px-1 ${
                            userProfile.role === r
                              ? 'bg-yellow-400 text-slate-950 shadow'
                              : 'text-blue-200 hover:text-white'
                          }`}
                        >
                          {r.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs text-blue-200 font-medium">Log in to sync your emergency profiles across devices</p>
                  <button
                    onClick={signInWithGoogle}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs py-2.5 rounded-xl shadow transition"
                  >
                    Sign In with Google Account
                  </button>
                </div>
              )}
            </div>

            {/* Menu Items List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              <div className="text-[11px] font-extrabold text-yellow-400 uppercase tracking-wider px-2">
                Main Application Modules
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left ${
                      isActive
                        ? 'bg-yellow-400 text-blue-950 shadow-lg font-black'
                        : 'bg-blue-900/40 hover:bg-blue-800/70 text-blue-100 border border-blue-800/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-950 text-yellow-400' : 'bg-blue-800/80 text-yellow-300'}`}>
                        <Icon className="w-5 h-5 shrink-0" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-bold truncate">{item.label}</div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-blue-900 font-semibold' : 'text-blue-300'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-blue-950' : 'text-blue-400'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Emergency Hotline Direct Actions Footer inside Drawer */}
            <div className="p-4 border-t border-blue-800/80 bg-blue-950 space-y-2">
              <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                Instant Emergency Dialers
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href="tel:112"
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 shadow"
                >
                  <Phone className="w-3.5 h-3.5 animate-pulse" />
                  <span>Call 112 (National)</span>
                </a>
                <a
                  href="tel:108"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 shadow"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 108 (Ambulance)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

