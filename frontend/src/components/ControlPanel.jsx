import React, { useState } from 'react';
import { Siren, Route, Camera, Activity } from 'lucide-react';

const LOCATIONS = [
  'Sindhi Camp', 'MI Road', 'Ajmeri Gate', 'Badi Choupad', 'SMS Hospital', 'Rambagh Circle', 'C-Scheme',
  'MNIT Jaipur', 'World Trade Park', 'Rajasthan University', 'Jhalana',
  'Vidhyadhar Nagar', 'Mansarovar', 'Vaishali Nagar', 'Jhotwara', 'Raja Park', 'Tonk Road', 
  'Pratap Nagar', 'Sanganer', 'Malviya Nagar', 'Civil Lines', 'JDA Circle'
].sort();

export function ControlPanel({ emergencyActive }) {
  const [loading, setLoading] = useState('');
  const [start, setStart] = useState('Badi Choupad');
  const [end, setEnd] = useState('SMS Hospital');

  const triggerEmergency = async () => {
    setLoading('emergency');
    await fetch('http://localhost:5000/api/emergency', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start, end })
    });
    setTimeout(() => setLoading(''), 500);
  };

  const triggerViolation = async () => {
    setLoading('violation');
    const res = await fetch('http://localhost:5000/api/violation', { method: 'POST' });
    const data = await res.json();
    // Auto generate challan for this
    if (data.violation) {
      await fetch('http://localhost:5000/api/challan', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ violationId: data.violation.id }) 
      });
    }
    setTimeout(() => setLoading(''), 500);
  };

  return (
    <div className="glass-panel p-5 flex flex-col gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-2">Systems Override</h3>
      
      {/* Emergency Form */}
      <div className={`transition-all rounded-xl border p-4 ${emergencyActive ? 'border-primary shadow-[0_0_20px_rgba(0,255,163,0.2)]' : 'border-white/10'}`}>
        <div className="flex items-center gap-3 mb-3">
          <Siren className={emergencyActive ? 'text-primary animate-pulse' : 'text-white/70'} size={20} />
          <h4 className={`font-semibold ${emergencyActive ? 'text-primary' : 'text-white'}`}>
            {emergencyActive ? 'Green Corridor Active' : 'Emergency Override'}
          </h4>
        </div>
        
        {!emergencyActive && (
          <div className="flex flex-col gap-2 mb-3">
            <select value={start} onChange={e => setStart(e.target.value)} className="bg-[#0A0A0A] border border-white/10 text-white text-xs rounded-lg block w-full p-2 outline-none focus:border-primary">
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select value={end} onChange={e => setEnd(e.target.value)} className="bg-[#0A0A0A] border border-white/10 text-white text-xs rounded-lg block w-full p-2 outline-none focus:border-primary">
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        )}

        <button 
          onClick={triggerEmergency}
          disabled={emergencyActive || loading === 'emergency'}
          className={`w-full py-2 rounded-lg font-medium transition-all text-sm ${emergencyActive ? 'bg-primary/20 text-primary/50 cursor-not-allowed' : 'bg-white/10 hover:bg-primary hover:text-black border border-white/10 hover:border-primary'}`}
        >
          {emergencyActive ? 'Algorithm Locked' : 'Trigger Ambulance'}
        </button>
      </div>

      <button 
        onClick={triggerViolation}
        disabled={loading === 'violation'}
        className="relative overflow-hidden group w-full p-4 rounded-xl flex items-center justify-between border bg-white/5 border-white/10 hover:bg-danger/20 hover:border-danger/50 transition-all"
      >
        <div className="flex items-center gap-3 relative z-10">
          <Camera className="text-white/70 group-hover:text-danger transition-colors" />
          <div className="text-left">
            <div className="font-semibold text-white group-hover:text-danger transition-colors">Detect Violation</div>
            <div className="text-xs text-white/40">Simulates AI camera detection</div>
          </div>
        </div>
      </button>

    </div>
  );
}
