import React, { useState, useEffect, useMemo } from 'react';
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
  const [aiOptimized, setAiOptimized] = useState(true);
  const [emergencyCorridor, setEmergencyCorridor] = useState([]);
  const [viewMode, setViewMode] = useState('2D');

  const displayNodes = useMemo(() => {
    if (!aiOptimized) return nodes;
    return nodes.map(n => {
      const newDensity = Math.max(10, (n.density || n.traffic || 0) - 40);
      // Keep realistic signal cycling from backend — don't override!
      // Only nudge signals toward green if density dropped below thresholds
      let signal = n.signal;
      if (newDensity < 30 && n.signal === 'red') signal = 'green';

      return {
        ...n,
        density: newDensity,
        signal
      };
    });
  }, [nodes, aiOptimized]);

  const fetchRoute = async (start, end) => {
    setLoadingRoute(true);
    const res = await fetch(`http://localhost:5000/api/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
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
        setEmergencyCorridor(data.emergencyCorridor || []);
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
            <h1 className="text-xl font-bold tracking-tight">मार्गदर्शक AI <span className="text-white/50 font-normal">Command Center</span></h1>
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
          {/* AI Optimization Mode */}
          <div 
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${aiOptimized ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            onClick={() => setAiOptimized(!aiOptimized)}
          >
            <Activity className={aiOptimized ? "text-primary flex-shrink-0 mt-1" : "text-white/40 flex-shrink-0 mt-1"} size={20} />
            <div>
              <h3 className={`font-medium mb-1 ${aiOptimized ? "text-primary" : "text-white"}`}>AI Optimization Engine</h3>
              <p className="text-xs text-white/50">{aiOptimized ? 'Active: Balancing network' : 'Offline: Raw simulated data'}</p>
            </div>
          </div>

          <ControlPanel emergencyActive={emergencyActive} />
          <SmartRoutePanel routeInfo={routeInfo} setRouteInfo={setRouteInfo} fetchRoute={fetchRoute} loading={loadingRoute} />
          <AlertsFeed alerts={alerts} />
        </div>

        {/* Center/Right - Map */}
        <div className="col-span-1 lg:col-span-3 glass-panel-heavy p-6 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Navigation size={18} className="text-secondary" /> Live City View
            </h2>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
              <button 
                onClick={() => setViewMode('2D')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === '2D' ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-white/50 hover:text-white'}`}
              >
                2D MAP
              </button>
              <button 
                onClick={() => setViewMode('3D')} 
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === '3D' ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,255,163,0.3)]' : 'text-white/50 hover:text-white'}`}
              >
                3D CITY
              </button>
            </div>
          </div>
          <div className="flex-1 relative rounded-xl border border-black/10 shadow-2xl overflow-hidden bg-[#e5e7eb]">
            {viewMode === '2D' ? (
              <GoogleTrafficMap nodes={displayNodes} emergencyActive={emergencyActive} emergencyCorridor={emergencyCorridor} alerts={alerts} routeInfo={routeInfo} />
            ) : (
              <ThreeDCityView nodes={displayNodes} />
            )}
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
