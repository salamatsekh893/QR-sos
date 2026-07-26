import React, { useState } from 'react';
import {
  PhoneCall,
  Search,
  Building2,
  Shield,
  Siren,
  Flame,
  Heart,
  Baby,
  Activity,
  MapPin,
  Clock
} from 'lucide-react';
import { EmergencyDirectoryItem } from '../types';

export const EmergencyDirectory: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const directoryData: EmergencyDirectoryItem[] = [
    {
      id: '1',
      category: 'Helpline',
      name: 'National Emergency Unified SOS',
      phone: '112',
      address: 'Pan-India Emergency Response Support System (ERSS)',
      city: 'Pan India',
      available24x7: true,
    },
    {
      id: '2',
      category: 'Ambulance',
      name: 'National Medical Ambulance Service',
      phone: '108',
      address: '24/7 National Emergency Ambulance Network',
      city: 'Pan India',
      available24x7: true,
    },
    {
      id: '3',
      category: 'Police',
      name: 'Police Control Room (PCR)',
      phone: '100',
      address: 'Central Police Command & Dispatch',
      city: 'Pan India',
      available24x7: true,
    },
    {
      id: '4',
      category: 'Fire Station',
      name: 'Fire & Rescue Emergency Service',
      phone: '101',
      address: 'National Fire Protection Command',
      city: 'Pan India',
      available24x7: true,
    },
    {
      id: '5',
      category: 'Helpline',
      name: 'Women Helpline & Rescue Service',
      phone: '1091',
      address: 'National Commission for Women Safety Desk',
      city: 'Pan India',
      available24x7: true,
    },
    {
      id: '6',
      category: 'Helpline',
      name: 'Child Emergency Line (Childline)',
      phone: '1098',
      address: 'Ministry of Women and Child Development',
      city: 'Pan India',
      available24x7: true,
    },
    {
      id: '7',
      category: 'Blood Bank',
      name: 'National Blood Transfusion Hotline',
      phone: '104',
      address: 'Red Cross & e-RaktKosh Blood Bank Registry',
      city: 'Pan India',
      available24x7: true,
    },
    {
      id: '8',
      category: 'Hospital',
      name: 'AIIMS Apex Trauma Center',
      phone: '+91 11 2658 8500',
      address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
      city: 'New Delhi',
      available24x7: true,
    },
    {
      id: '9',
      category: 'Helpline',
      name: 'Elderly & Senior Citizen Helpline',
      phone: '14567',
      address: 'National Helpline for Senior Citizens (Elderline)',
      city: 'Pan India',
      available24x7: true,
    },
    {
      id: '10',
      category: 'Helpline',
      name: 'Disaster Management Control Room',
      phone: '1070',
      address: 'National Disaster Response Force (NDRF)',
      city: 'Pan India',
      available24x7: true,
    },
  ];

  const categories = ['All', 'Helpline', 'Ambulance', 'Police', 'Fire Station', 'Hospital', 'Blood Bank'];

  const filteredItems = directoryData.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 border border-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <PhoneCall className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-extrabold">National Emergency Directory</h2>
        </div>
        <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
          Verified, toll-free 24/7 direct access numbers for Hospitals, Ambulances, Police PCR, Women & Child Safety Helplines, Blood Banks, and Disaster Rescue across India.
        </p>

        {/* Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by service name, helpline number, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-yellow-400 font-medium shadow-inner"
            />
          </div>

          <div className="flex overflow-x-auto gap-2 pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap font-extrabold transition ${
                  selectedCategory === cat
                    ? 'bg-yellow-400 text-blue-950 shadow'
                    : 'bg-blue-800/80 text-blue-100 hover:bg-blue-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-xl flex flex-col justify-between hover:border-blue-400 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono font-extrabold bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  24/7 Service
                </span>
              </div>

              <h4 className="font-extrabold text-base text-slate-900">{item.name}</h4>
              <div className="flex items-start space-x-1.5 text-xs text-slate-600 mt-2 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{item.address}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xl font-black font-mono text-blue-700">{item.phone}</div>

              <a
                href={`tel:${item.phone}`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow transition transform active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
