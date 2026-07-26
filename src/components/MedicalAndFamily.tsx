import React, { useEffect, useState } from 'react';
import {
  HeartPulse,
  Users,
  Plus,
  Trash2,
  Save,
  Check,
  Shield,
  Phone,
  UserCheck,
  FileText,
  Hospital
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MedicalProfile, EmergencyContact } from '../types';
import {
  getMedicalProfile,
  saveMedicalProfile,
  subscribeToEmergencyContacts,
  saveEmergencyContact,
  deleteEmergencyContact
} from '../services/firestoreService';

export const MedicalAndFamily: React.FC = () => {
  const { userProfile } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);

  // Medical Profile State
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [allergies, setAllergies] = useState<string>('Penicillin, Peanuts');
  const [chronicDiseases, setChronicDiseases] = useState<string>('Asthma (Mild)');
  const [currentMedications, setCurrentMedications] = useState<string>('Inhaler when required');
  const [doctorName, setDoctorName] = useState<string>('Dr. A. K. Sharma');
  const [doctorPhone, setDoctorPhone] = useState<string>('+91 98111 22334');
  const [hospitalName, setHospitalName] = useState<string>('AIIMS / Max Healthcare New Delhi');
  const [insurancePolicyNo, setInsurancePolicyNo] = useState<string>('STAR-HLTH-8839201');
  const [organDonor, setOrganDonor] = useState<boolean>(true);
  const [emergencyNotes, setEmergencyNotes] = useState<string>('Allergic to Penicillin. Contact spouse or father first in case of emergency.');

  // New Contact Form State
  const [cName, setCName] = useState<string>('');
  const [cRelationship, setCRelationship] = useState<string>('Spouse');
  const [cPhone, setCPhone] = useState<string>('');
  const [cPriority, setCPriority] = useState<'Primary' | 'Secondary' | 'Guardian'>('Primary');

  useEffect(() => {
    if (!userProfile) return;

    // Load Medical Profile
    getMedicalProfile(userProfile.uid).then((med) => {
      if (med) {
        setBloodGroup(med.bloodGroup || 'O+');
        setAllergies(med.allergies || '');
        setChronicDiseases(med.chronicDiseases || '');
        setCurrentMedications(med.currentMedications || '');
        setDoctorName(med.doctorName || '');
        setDoctorPhone(med.doctorPhone || '');
        setHospitalName(med.hospitalName || '');
        setInsurancePolicyNo(med.insurancePolicyNo || '');
        setOrganDonor(med.organDonor ?? true);
        setEmergencyNotes(med.emergencyNotes || '');
      }
    });

    // Subscribe to Emergency Contacts
    const unsubscribe = subscribeToEmergencyContacts(userProfile.uid, (data) => {
      setContacts(data);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const handleSaveMedicalProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    const medData: MedicalProfile = {
      userId: userProfile.uid,
      bloodGroup,
      allergies,
      chronicDiseases,
      currentMedications,
      doctorName,
      doctorPhone,
      hospitalName,
      insurancePolicyNo,
      organDonor,
      emergencyNotes,
    };

    try {
      await saveMedicalProfile(medData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Save Medical Profile Error:', err);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !cName || !cPhone) return;

    const newContact: EmergencyContact = {
      id: `CONT_${Date.now()}`,
      userId: userProfile.uid,
      name: cName,
      relationship: cRelationship,
      phone: cPhone,
      priority: cPriority,
    };

    try {
      await saveEmergencyContact(newContact);
      setIsAddingContact(false);
      setCName('');
      setCPhone('');
    } catch (err) {
      console.error('Add Contact Error:', err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await deleteEmergencyContact(id);
    } catch (err) {
      console.error('Delete Contact Error:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 border border-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <HeartPulse className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-extrabold">Medical Health Profile & Family Directory</h2>
        </div>
        <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
          Maintain your complete medical history, blood group, allergies, preferred hospitals, and emergency contacts. This data is synced live to your dynamic QR code for emergency responders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Medical Profile Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-slate-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <h3 className="text-lg font-bold flex items-center space-x-2 text-slate-900">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Medical & Hospital Profile</span>
            </h3>

            {saveSuccess && (
              <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Saved to Firestore</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveMedicalProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-extrabold text-sm"
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

              <div>
                <label className="block text-slate-600 font-medium mb-1">Health Insurance Policy No.</label>
                <input
                  type="text"
                  value={insurancePolicyNo}
                  onChange={(e) => setInsurancePolicyNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                  placeholder="e.g. STAR-883920"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="e.g. Penicillin, Dust, Peanuts"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Chronic Illnesses / Diseases</label>
                <input
                  type="text"
                  value={chronicDiseases}
                  onChange={(e) => setChronicDiseases(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="e.g. Diabetes, Asthma, Hypertension"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Current Medications</label>
                <input
                  type="text"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="e.g. Insulin, Inhaler"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Doctor Name & Phone</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                    placeholder="Doctor Name"
                  />
                  <input
                    type="text"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                    placeholder="Doctor Phone"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Preferred Hospital / Trauma Center</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                placeholder="e.g. AIIMS Trauma Center New Delhi"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Emergency Responders Notes</label>
              <textarea
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                placeholder="Important instructions for doctors or ambulance staff"
              />
            </div>

            <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={organDonor}
                onChange={(e) => setOrganDonor(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white border-slate-300"
              />
              <span className="font-bold text-slate-800">Pledged Organ Donor (Displays red heart badge on QR tag)</span>
            </label>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center space-x-2 text-sm transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Verified Medical Profile</span>
            </button>
          </form>
        </div>

        {/* Right Family & Emergency Contacts List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">Emergency Contacts</h3>
              </div>
              <button
                onClick={() => setIsAddingContact(!isAddingContact)}
                className="p-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-lg text-xs font-black flex items-center space-x-1 shadow"
              >
                <Plus className="w-4 h-4 text-blue-950" />
                <span>Add Contact</span>
              </button>
            </div>

            {/* Add Contact Form */}
            {isAddingContact && (
              <form onSubmit={handleAddContact} className="bg-slate-50 p-4 rounded-xl space-y-3 mb-4 text-xs border border-slate-200 shadow-inner">
                <input
                  type="text"
                  placeholder="Full Name (e.g. Anjali Sharma)"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={cRelationship}
                    onChange={(e) => setCRelationship(e.target.value)}
                    className="p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Child">Child</option>
                    <option value="Guardian">Guardian</option>
                  </select>

                  <select
                    value={cPriority}
                    onChange={(e) => setCPriority(e.target.value as any)}
                    className="p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                  >
                    <option value="Primary">Primary (1st Call)</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Phone Number (+91 98765 00000)"
                  value={cPhone}
                  onChange={(e) => setCPhone(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                />

                <div className="flex justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingContact(false)}
                    className="px-3 py-1 bg-slate-200 text-slate-700 rounded-md font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-blue-600 text-white rounded-md font-black shadow"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            )}

            {/* Contacts List */}
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  No emergency contacts added yet. Click "+ Add Contact" above.
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 text-sm">{contact.name}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-black px-2 py-0.5 rounded border border-blue-200">
                          {contact.priority}
                        </span>
                      </div>
                      <div className="text-slate-600 font-mono font-semibold mt-0.5">
                        {contact.relationship} • {contact.phone}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={`tel:${contact.phone}`}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-2 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
