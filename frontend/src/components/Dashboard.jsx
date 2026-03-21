import React, { useState, useEffect } from 'react';
import { GoogleTrafficMap } from './GoogleTrafficMap';
import { ThreeDCityView } from './ThreeDCityView';
import { ControlPanel } from './ControlPanel';
import { AlertsFeed } from './AlertsFeed';
import { SmartRoutePanel } from './SmartRoutePanel';
import { Activity, ShieldAlert, Navigation, Settings, BarChart2 } from 'lucide-react';

export function Dashboard() {
  const [metrics, setMetrics] = useState({
    efficiency: 0,
    congestionReduced: 0,
    violationsDetected: 0,
    avgResponseTimeMin: 0
  });

  const [nodes, setNodes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const fetchRoute = async () => {
    setLoadingRoute(true);
    const res = await fetch('http://localhost:5000/api/route');
    const data = await res.json();
    setRouteInfo(data);
    setLoadingRoute(false);
  };

  // Poll backend
  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/traffic-data');
        const data = await res.json();
        setNodes(data.nodes);
        setEmergencyActive(data.emergencyActive);
      } catch (e) {
        console.error("Backend not running");
      }
    };

    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/metrics');
        const data = await res.json();
        setMetrics(data.metrics);
        setAlerts(data.recentViolations || []);
      } catch (e) {}
    };

    fetchTraffic();
    fetchMetrics();
    const tInterval = setInterval(fetchTraffic, 2000);
    const mInterval = setInterval(fetchMetrics, 3000);

    return () => { clearInterval(tInterval); clearInterval(mInterval); }
  }, []);

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* Header */}
      <header className="flex justify-between items-center glass-panel p-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.4)]">
            <Activity className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">NEXUS <span className="text-white/50 font-normal">Command Center</span></h1>
            <p className="text-xs text-primary flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              System Online
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <StatBox title="System Efficiency" value={`${metrics.efficiency}%`} highlight />
          <StatBox title="Congestion Reduced" value={`${metrics.congestionReduced}%`} />
          <StatBox title="Response Time" value={`${metrics.avgResponseTimeMin.toFixed(1)}m`} />
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column - Controls & Alerts */}
        <div className="flex flex-col gap-6 col-span-1">
          <ControlPanel emergencyActive={emergencyActive} />
          <SmartRoutePanel routeInfo={routeInfo} setRouteInfo={setRouteInfo} fetchRoute={fetchRoute} loading={loadingRoute} />
          <AlertsFeed alerts={alerts} />
        </div>

        {/* Center/Right - Map */}
        <div className="col-span-1 lg:col-span-3 glass-panel-heavy p-6 relative overflow-hidden flex flex-col">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Navigation size={18} className="text-secondary" /> Live City View
          </h2>
          <div className="flex-1 relative rounded-xl border border-black/10 shadow-2xl overflow-hidden bg-[#e5e7eb]">
            <GoogleTrafficMap nodes={nodes} emergencyActive={emergencyActive} alerts={alerts} routeInfo={routeInfo} />
          </div>
        </div>

      </div>

    </div>
  );
}

function StatBox({ title, value, highlight }) {
  return (
    <div className={`glass-panel px-4 py-2 flex flex-col justify-center border-l-2 ${highlight ? 'border-l-primary' : 'border-l-white/10'}`}>
      <span className="text-[10px] uppercase tracking-wider text-white/50">{title}</span>
      <span className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-white'}`}>{value}</span>
    </div>
  );
}
