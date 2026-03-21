import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export function AlertsFeed({ alerts }) {
  return (
    <div className="glass-panel p-5 flex-1 flex flex-col overflow-hidden">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4 flex items-center gap-2">
        <AlertCircle size={16}/> Live Alerts Feed
      </h3>
      
      <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="text-center text-white/30 text-sm py-10">No recent anomalies</div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-3 items-start animate-[slideIn_0.3s_ease-out]">
              <div className="mt-1 bg-red-500/20 p-1.5 rounded-md text-red-500">
                <Camera size={14} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-red-400 text-sm">{alert.type}</span>
                  <span className="text-[10px] text-white/40">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs text-white/60 mb-1">Loc: {alert.location} | Conf: {alert.confidence}%</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-mono bg-black/40 px-2 py-0.5 rounded text-white/80">{alert.vehicleNumber}</span>
                  <span className="text-[10px] uppercase text-red-400/80 tracking-wider">Challan Issued</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
