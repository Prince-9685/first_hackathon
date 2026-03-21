import React, { useState } from 'react';
import { Siren, Route, Camera } from 'lucide-react';

export function ControlPanel({ emergencyActive }) {
  const [loading, setLoading] = useState('');

  const triggerEmergency = async () => {
    setLoading('emergency');
    await fetch('http://localhost:5000/api/emergency', { method: 'POST' });
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
      
      <button 
        onClick={triggerEmergency}
        disabled={emergencyActive || loading === 'emergency'}
        className={`relative overflow-hidden group w-full p-4 rounded-xl flex items-center justify-between border transition-all ${
          emergencyActive 
            ? 'bg-primary/20 border-primary cursor-not-allowed shadow-[0_0_20px_rgba(0,255,163,0.3)]' 
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50'
        }`}
      >
        <div className="flex items-center gap-3 relative z-10">
          <Siren className={emergencyActive ? 'text-primary animate-pulse' : 'text-white/70'} />
          <div className="text-left">
            <div className={`font-semibold ${emergencyActive ? 'text-primary' : 'text-white'}`}>
              {emergencyActive ? 'Green Corridor Active' : 'Trigger Ambulance'}
            </div>
            <div className="text-xs text-white/40">Overrides signals on route</div>
          </div>
        </div>
      </button>

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
