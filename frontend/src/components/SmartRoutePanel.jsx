import React, { useState } from 'react';
import { Route, Map as MapIcon, ChevronRight } from 'lucide-react';

const LOCATIONS = [
  'Sindhi Camp', 'MI Road', 'Ajmeri Gate', 'Badi Choupad', 'SMS Hospital', 'Rambagh Circle', 'C-Scheme',
  'MNIT Jaipur', 'World Trade Park', 'Rajasthan University', 'Jhalana',
  'Vidhyadhar Nagar', 'Mansarovar', 'Vaishali Nagar', 'Jhotwara', 'Raja Park', 'Tonk Road', 
  'Pratap Nagar', 'Sanganer', 'Malviya Nagar', 'Civil Lines', 'JDA Circle'
].sort();

export function SmartRoutePanel({ routeInfo, setRouteInfo, fetchRoute, loading }) {
  const [start, setStart] = useState('Sindhi Camp');
  const [end, setEnd] = useState('Jhalana');

  return (
    <div className="glass-panel p-5 mt-6 flex flex-col gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-2 flex items-center gap-2">
        <Route size={16} /> Smart Routing Engine
      </h3>

      {!routeInfo ? (
        <>
          <div className="flex flex-col gap-2">
            <select value={start} onChange={e => setStart(e.target.value)} className="bg-[#0A0A0A] border border-white/10 text-white text-xs rounded-lg block w-full p-2.5 outline-none focus:border-primary">
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select value={end} onChange={e => setEnd(e.target.value)} className="bg-[#0A0A0A] border border-white/10 text-white text-xs rounded-lg block w-full p-2.5 outline-none focus:border-primary">
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <button 
            onClick={() => fetchRoute(start, end)}
            disabled={loading}
          className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-secondary/50 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading ? 'Calculating Paths...' : 'Generate Route'}
        </button>
        </>
      ) : (
        <div className="flex flex-col gap-3 animate-[fadeIn_0.5s_ease-out]">
          {/* Standard Route */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex justify-between items-center opacity-60 overflow-hidden">
            <div className="w-[70%]">
              <div className="text-xs text-white/50 mb-1">Standard Route</div>
              <div className="text-sm font-medium flex flex-wrap items-center gap-x-1 gap-y-1">
                {routeInfo.standardRoute.path.map((p, i) => (
                  <React.Fragment key={p}>
                    <span className="truncate">{p.split(' ')[0]}</span>
                    {i < routeInfo.standardRoute.path.length-1 && <ChevronRight size={10} className="shrink-0 text-white/40"/>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-danger">{routeInfo.standardRoute.etaMins}m</div>
              <div className="text-[10px] uppercase text-danger/80">High Traffic</div>
            </div>
          </div>

          {/* Smart Route */}
          <div className="bg-secondary/10 border border-secondary/50 p-3 rounded-lg flex justify-between items-center shadow-[0_0_15px_rgba(139,92,246,0.2)] overflow-hidden">
            <div className="w-[70%]">
              <div className="text-xs text-secondary mb-1 flex items-center gap-1">
                <MapIcon size={12} /> AI Suggested Route
              </div>
              <div className="text-sm font-medium flex flex-wrap items-center gap-x-1 gap-y-1 text-white/90">
                {routeInfo.smartRoute.path.map((p, i) => (
                  <React.Fragment key={p}>
                    <span className="truncate">{p.split(' ')[0]}</span>
                    {i < routeInfo.smartRoute.path.length-1 && <ChevronRight size={10} className="shrink-0 text-primary/40"/>}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-[10px] text-primary mt-1">{routeInfo.smartRoute.note}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{routeInfo.smartRoute.etaMins}m</div>
              <div className="text-[10px] uppercase text-primary/80">Clear</div>
            </div>
          </div>
          
          <button 
            onClick={() => setRouteInfo(null)}
            className="text-xs text-white/40 hover:text-white mt-1 text-center w-full"
          >
            Reset Route
          </button>
        </div>
      )}
    </div>
  );
}
