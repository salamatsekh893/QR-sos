import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MedicalService } from '../services/MedicalService';
import { EmergencyContact, UserProfile } from '../types';
import {
  User,
  Phone,
  Calendar,
  MapPin,
  Heart,
  ShieldAlert,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';

export const CompleteProfileOnboarding: React.FC = () => {
  const { userProfile, completeUserProfile } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1 Form Data
  const [fullName, setFullName] = useState<string>(userProfile?.fullName || '');
  const [phone, setPhone] = useState<string>(userProfile?.phone || '');
  const [dob, setDob] = useState<string>(userProfile?.dob || '');
  const [gender, setGender] = useState<string>(userProfile?.gender || 'Male');

  // Step 2 Form Data
  const [bloodGroup, setBloodGroup] = useState<string>(userProfile?.bloodGroup || 'O+');
  const [address, setAddress] = useState<string>(userProfile?.address || '');
  const [state, setState] = useState<string>(userProfile?.state || '');
  const [district, setDistrict] = useState<string>(userProfile?.district || '');
  const [pincode, setPincode] = useState<string>(userProfile?.pincode || '');

  // Step 3 Form Data (Emergency Contacts)
  const [c1Name, setC1Name] = useState<string>('');
  const [c1Phone, setC1Phone] = useState<string>('');
  const [c1Rel, setC1Rel] = useState<string>('Father');

  const [c2Name, setC2Name] = useState<string>('');
  const [c2Phone, setC2Phone] = useState<string>('');
  const [c2Rel, setC2Rel] = useState<string>('Mother');

  // Step 4 Form Data (Medical Info)
  const [medicalConditions, setMedicalConditions] = useState<string>('');
  const [allergies, setAllergies] = useState<string>('');
  const [currentMedicines, setCurrentMedicines] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');

  const validateStep1 = (): boolean => {
    setErrorMsg(null);
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Valid 10-digit Mobile Number is required.');
      return false;
    }
    if (!dob) {
      setErrorMsg('Date of Birth is required.');
      return false;
    }
    if (!gender) {
      setErrorMsg('Gender selection is required.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setErrorMsg(null);
    if (!bloodGroup) {
      setErrorMsg('Blood Group selection is required.');
      return false;
    }
    if (!address.trim()) {
      setErrorMsg('Address is required.');
      return false;
    }
    if (!state.trim()) {
      setErrorMsg('State is required.');
      return false;
    }
    if (!district.trim()) {
      setErrorMsg('District is required.');
      return false;
    }
    if (!pincode.trim() || pincode.replace(/\D/g, '').length < 6) {
      setErrorMsg('Valid 6-digit PIN Code is required.');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    setErrorMsg(null);
    if (!c1Name.trim() || !c1Phone.trim() || c1Phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Emergency Contact 1 requires a valid name and 10-digit mobile number.');
      return false;
    }
    if (!c2Name.trim() || !c2Phone.trim() || c2Phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Emergency Contact 2 requires a valid name and 10-digit mobile number.');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    setErrorMsg(null);
    if (!medicalConditions.trim()) {
      setErrorMsg('Medical Conditions field is required (Enter "None" if inapplicable).');
      return false;
    }
    if (!allergies.trim()) {
      setErrorMsg('Allergies field is required (Enter "None" if inapplicable).');
      return false;
    }
    if (!currentMedicines.trim()) {
      setErrorMsg('Current Medicines field is required (Enter "None" if inapplicable).');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) return;
    if (!userProfile) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Prepare updated User Profile
      const updatedUser: UserProfile = {
        ...userProfile,
        fullName: fullName.trim(),
        phone: phone.trim(),
        dob,
        gender,
        bloodGroup,
        address: address.trim(),
        state: state.trim(),
        district: district.trim(),
        city: district.trim(),
        pincode: pincode.trim(),
        profileCompleted: true,
      };

      // 2. Save Emergency Contacts
      const contact1: EmergencyContact = {
        id: `EC_${Date.now()}_1`,
        userId: userProfile.uid,
        name: c1Name.trim(),
        phone: c1Phone.trim(),
        relationship: c1Rel,
        priority: 'Primary',
      };

      const contact2: EmergencyContact = {
        id: `EC_${Date.now()}_2`,
        userId: userProfile.uid,
        name: c2Name.trim(),
        phone: c2Phone.trim(),
        relationship: c2Rel,
        priority: 'Secondary',
      };

      await MedicalService.saveContact(contact1);
      await MedicalService.saveContact(contact2);

      // 3. Save Medical Profile
      await MedicalService.saveProfile({
        userId: userProfile.uid,
        bloodGroup,
        allergies: allergies.trim(),
        chronicDiseases: medicalConditions.trim(),
        currentMedications: currentMedicines.trim(),
        doctorName: doctorName.trim() || undefined,
      });

      // 4. Save User Document with profileCompleted = true & redirect
      await completeUserProfile(updatedUser);
    } catch (err: any) {
      console.error('Error completing profile:', err);
      setErrorMsg('Failed to save profile. Please check network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Onboarding Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-blue-900 rounded-2xl p-6 text-white shadow-xl mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <ShieldAlert className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">SAFE LIFE PLUS</h1>
            <p className="text-xs text-red-100 mt-1 font-medium">
              Complete Emergency Profile Setup (Required for SOS & QR Response)
            </p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-bold text-white mb-2">
            <span className={step >= 1 ? 'text-yellow-300' : 'opacity-60'}>1. Basic Info</span>
            <span className={step >= 2 ? 'text-yellow-300' : 'opacity-60'}>2. Location</span>
            <span className={step >= 3 ? 'text-yellow-300' : 'opacity-60'}>3. Emergency Contacts</span>
            <span className={step >= 4 ? 'text-yellow-300' : 'opacity-60'}>4. Medical Info</span>
          </div>
          <div className="w-full bg-red-950/60 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-yellow-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl mb-6 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs font-bold text-red-800">{errorMsg}</p>
        </div>
      )}

      {/* Main Step Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
        <form onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}>
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
                <User className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-slate-900">Step 1: Personal Details</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Sharma"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full border border-slate-300 rounded-xl pl-12 pr-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address & Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-slate-900">Step 2: Location & Address</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none font-bold text-red-600"
                  required
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Street / Area / Landmark"
                  rows={2}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. West Bengal"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Kolkata"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="700001"
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Emergency Contacts */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-slate-900">Step 3: Emergency Contacts</h2>
              </div>

              {/* Contact 1 */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Emergency Contact 1 (Primary)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={c1Name}
                      onChange={(e) => setC1Name(e.target.value)}
                      placeholder="e.g. Suresh Sharma"
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile *</label>
                    <input
                      type="tel"
                      value={c1Phone}
                      onChange={(e) => setC1Phone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Relationship *</label>
                    <select
                      value={c1Rel}
                      onChange={(e) => setC1Rel(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Friend">Friend</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact 2 */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Emergency Contact 2 (Secondary)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={c2Name}
                      onChange={(e) => setC2Name(e.target.value)}
                      placeholder="e.g. Sunita Sharma"
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile *</label>
                    <input
                      type="tel"
                      value={c2Phone}
                      onChange={(e) => setC2Phone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Relationship *</label>
                    <select
                      value={c2Rel}
                      onChange={(e) => setC2Rel(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                      required
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Friend">Friend</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Medical Details */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-slate-900">Step 4: Medical Profile</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medical Conditions / Chronic Illnesses <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Diabetes Type 2, Asthma, Hypertension (Enter 'None' if applicable)"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Known Allergies <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Dust, Latex (Enter 'None' if applicable)"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Medicines <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentMedicines}
                  onChange={(e) => setCurrentMedicines(e.target.value)}
                  placeholder="e.g. Metformin 500mg, Inhaler (Enter 'None' if applicable)"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Doctor / Hospital Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. A. K. Roy (Apollo Hospital)"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={loading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-lg transition"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-xs font-extrabold rounded-xl shadow-xl transition transform active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span>Saving Profile...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Profile & Go to Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
