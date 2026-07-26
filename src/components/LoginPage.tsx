import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConfirmationResult } from 'firebase/auth';
import {
  ShieldAlert,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Shield,
  KeyRound,
  RefreshCw
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInWithPhone, confirmOTP } = useAuth();

  const [loginMethod, setLoginMethod] = useState<'phone' | 'google'>('phone');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    setInfoMsg(null);
  }, [loginMethod]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? `+${cleanPhone}`
      : `+91${cleanPhone.slice(-10)}`;

    setLoading(true);
    try {
      const result = await signInWithPhone(formattedPhone, 'recaptcha-container');
      if (result) {
        setConfirmationResult(result);
        setOtpSent(true);
        setInfoMsg(`OTP verification code sent via SMS to ${formattedPhone}`);
      } else {
        setErrorMsg('Failed to send verification SMS. Please verify your phone number and retry.');
      }
    } catch (err: any) {
      console.error('Phone Auth error:', err);
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        setErrorMsg('SMS Phone Authentication is currently not enabled in your Firebase Console project. Please log in using Google Account below.');
        setLoginMethod('google');
      } else {
        setErrorMsg(err?.message || 'Error sending OTP SMS. Please check mobile number format or try Google login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP code sent to your phone.');
      return;
    }

    if (!confirmationResult) {
      setErrorMsg('Session expired. Please request a new OTP.');
      setOtpSent(false);
      return;
    }

    setLoading(true);
    try {
      await confirmOTP(confirmationResult, otpCode.trim());
    } catch (err: any) {
      console.error('OTP Verification error:', err);
      setErrorMsg('Invalid verification code. Please check SMS and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      setErrorMsg(err.message || 'Google authentication failed. Please try again or use Mobile OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.25),rgba(255,255,255,0))] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* Recaptcha container */}
      <div id="recaptcha-container"></div>

      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-red-600 p-2.5 rounded-2xl shadow-lg shadow-red-600/40 ring-1 ring-red-400/30">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-wider flex items-center gap-1.5">
              SAFE LIFE <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">PLUS</span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Emergency Response Ecosystem</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-green-400" />
          <span>256-Bit Encrypted Security Vault</span>
        </div>
      </header>

      {/* Main Authentication Box */}
      <main className="max-w-md mx-auto w-full my-auto py-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Accent Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-blue-600"></div>

          {/* Title */}
          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Secure Authentication</h1>
            <p className="text-xs text-slate-400">
              Log in to access your Emergency QR Tags, Medical Vault & Response Console.
            </p>
          </div>

          {/* Authentication Method Tabs: Mobile OTP or Google ONLY */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('phone');
                setOtpSent(false);
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                loginMethod === 'phone'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginMethod('google')}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                loginMethod === 'google'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Google Login</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-950/90 border border-red-500/60 p-3.5 rounded-2xl mb-5 flex items-start space-x-2.5 text-xs text-red-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Info Message */}
          {infoMsg && (
            <div className="bg-emerald-950/90 border border-emerald-500/60 p-3.5 rounded-2xl mb-5 flex items-start space-x-2.5 text-xs text-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="font-semibold">{infoMsg}</span>
            </div>
          )}

          {/* METHOD 1: Mobile OTP Login */}
          {loginMethod === 'phone' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3 text-xs font-extrabold text-slate-400 flex items-center gap-1">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-2xl pl-16 pr-4 py-3 text-sm text-white font-medium focus:ring-2 focus:ring-red-500/30 focus:outline-none transition-all placeholder:text-slate-600"
                        required
                        disabled={loading}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      A 6-digit One-Time Password (OTP) will be sent via SMS for verification.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phoneNumber.trim()}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-red-600/30 text-xs flex items-center justify-center space-x-2 transition transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Requesting SMS Code...</span>
                      </div>
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        <span>Send OTP SMS</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Enter 6-Digit OTP <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('');
                          setErrorMsg(null);
                        }}
                        className="text-[11px] text-red-400 hover:underline font-semibold"
                      >
                        Change Number
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-red-500 rounded-2xl text-center tracking-[0.5em] py-3 text-lg text-yellow-400 font-mono font-black focus:ring-2 focus:ring-red-500/30 focus:outline-none transition-all placeholder:tracking-normal placeholder:text-slate-600"
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                      Code sent to <span className="text-white font-bold">{phoneNumber}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-emerald-600/30 text-xs flex items-center justify-center space-x-2 transition transform active:scale-98 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Authenticating Code...</span>
                      </div>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Verify & Login</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* METHOD 2: Google Sign-In */}
          {loginMethod === 'google' && (
            <div className="space-y-4 py-2 text-center">
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Sign in securely with your official Google Account.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-2xl shadow-xl text-xs flex items-center justify-center space-x-3 transition transform active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2 text-slate-700">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Connecting to Google...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google Account</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-slate-400">
                🔒 Protected by Firebase Authentication & SSL 256-Bit Encryption.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full text-center pt-6 text-xs text-slate-500">
        <p>SAFE LIFE Network • Production Emergency Ecosystem</p>
      </footer>
    </div>
  );
};
