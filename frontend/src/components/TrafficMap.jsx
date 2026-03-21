import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import routeDB from '../utils/routeDB.json';

// Fix for leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Using custom icon for ambulance
const ambulanceIcon = new L.DivIcon({
  className: 'bg-primary rounded-full shadow-[0_0_15px_#00FFA3] animate-pulse flex items-center justify-center border-2 border-white',
  html: '<div style="width: 12px; height: 12px; border-radius: 50%;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Custom icon for alerts
const alertIcon = new L.DivIcon({
  className: 'bg-danger rounded-full shadow-[0_0_15px_#EF4444] flex items-center justify-center border-2 border-white',
  html: '<div style="width: 12px; height: 12px; border-radius: 50%;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Massive Database of Jaipur Nodes
const NODE_POSITIONS = {
  // Main Hubs
  'Sindhi Camp': [26.9240, 75.7997],
  'MI Road': [26.9155, 75.8043],
  'Ajmeri Gate': [26.9157, 75.8189],
  'Badi Choupad': [26.9239, 75.8275],
  'SMS Hospital': [26.9044, 75.8143],
  'Rambagh Circle': [26.8973, 75.8078],
  'C-Scheme': [26.9080, 75.7950],
  
  // Real Locations Request
  'MNIT Jaipur': [26.8631, 75.8116],
  'World Trade Park': [26.8273, 75.8075],
  'Rajasthan University': [26.8858, 75.8186],
  'Jhalana': [26.8524, 75.8239],
  
  // Background Database Simulation Nodes
  'Vidhyadhar Nagar': [26.9538, 75.7725],
  'Mansarovar': [26.8549, 75.7603],
  'Vaishali Nagar': [26.9126, 75.7423],
  'Jhotwara': [26.9467, 75.7380],
  'Raja Park': [26.8920, 75.8273],
  'Tonk Road': [26.8500, 75.8000],
  'Pratap Nagar': [26.8122, 75.8198],
  'Sanganer': [26.8208, 75.7951],
  'Malviya Nagar': [26.8530, 75.8047],
  'Civil Lines': [26.9055, 75.7831]
};

const MAIN_EDGES = [
  ['Sindhi Camp', 'MI Road'],
  ['MI Road', 'Ajmeri Gate'],
  ['Ajmeri Gate', 'Badi Choupad'],
  ['Sindhi Camp', 'C-Scheme'],
  ['C-Scheme', 'Rambagh Circle'],
  ['Rambagh Circle', 'SMS Hospital'],
  ['SMS Hospital', 'Badi Choupad'],
  ['Ajmeri Gate', 'SMS Hospital'],
  ['MI Road', 'C-Scheme']
];

const BACKGROUND_EDGES = [
  ['Vidhyadhar Nagar', 'Sindhi Camp'],
  ['Vaishali Nagar', 'Civil Lines'],
  ['Jhotwara', 'Vidhyadhar Nagar'],
  ['Civil Lines', 'C-Scheme'],
  ['Rambagh Circle', 'Raja Park'],
  ['Tonk Road', 'Malviya Nagar'],
  ['Mansarovar', 'Tonk Road'],
  ['Sanganer', 'Pratap Nagar'],
  ['Malviya Nagar', 'Pratap Nagar'],
  ['SMS Hospital', 'Raja Park'],
  ['Vaishali Nagar', 'Mansarovar'],
  ['Rajasthan University', 'MNIT Jaipur'],
  ['MNIT Jaipur', 'Jhalana'],
  ['Jhalana', 'World Trade Park']
];

const EMERGENCY_CORRIDOR_PATH = ['Sindhi Camp', 'MI Road', 'SMS Hospital'];

function getInterpolatedPoint(pathCoords, progress) {
  if (!pathCoords || pathCoords.length === 0) return [0, 0];
  if (pathCoords.length === 1 || progress <= 0) return pathCoords[0];
  if (progress >= 1) return pathCoords[pathCoords.length - 1];

  let totalDist = 0;
  const segments = [];
  for (let i = 0; i < pathCoords.length - 1; i++) {
    const p1 = pathCoords[i];
    const p2 = pathCoords[i + 1];
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    totalDist += dist;
    segments.push({ p1, p2, dist, dx, dy });
  }

  if (totalDist === 0) return pathCoords[0];

  const targetDist = progress * totalDist;
  let currentDist = 0;
  for (let seg of segments) {
    if (currentDist + seg.dist >= targetDist) {
      const segProgress = seg.dist === 0 ? 0 : (targetDist - currentDist) / seg.dist;
      return [
        seg.p1[0] + seg.dx * segProgress,
        seg.p1[1] + seg.dy * segProgress
      ];
    }
    currentDist += seg.dist;
  }
  return pathCoords[pathCoords.length - 1];
}

export function TrafficMap({ nodes, emergencyActive, alerts, routeInfo }) {
  const [ambProgress, setAmbProgress] = useState(0);

  const getPathArray = (from, to) => {
    if (routeDB[`${from}_${to}`]) return routeDB[`${from}_${to}`];
    if (routeDB[`${to}_${from}`]) return [...routeDB[`${to}_${from}`]].reverse();
    return [NODE_POSITIONS[from], NODE_POSITIONS[to]]; // strict fallback
  };

  const buildContinuousPath = (nodeIds) => {
    let full = [];
    for (let i = 0; i < nodeIds.length - 1; i++) {
      const segment = getPathArray(nodeIds[i], nodeIds[i + 1]);
      if (i > 0) segment.shift();
      full = full.concat(segment);
    }
    return full;
  };

  // Ambulance Animation Loop
  useEffect(() => {
    if (!emergencyActive) {
      setAmbProgress(0);
      return;
    }
    let start = performance.now();
    let rAF;
    const animate = (time) => {
      let elapsed = time - start;
      let progress = (elapsed % 4000) / 4000;
      setAmbProgress(progress);
      rAF = requestAnimationFrame(animate);
    };
    rAF = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rAF);
  }, [emergencyActive]);

  const fullAmbRoute = useMemo(() => {
    return buildContinuousPath(EMERGENCY_CORRIDOR_PATH);
  }, []); // Offline data is static

  const ambPos = getInterpolatedPoint(fullAmbRoute, ambProgress);
  const isEmergencyNode = (id) => emergencyActive && EMERGENCY_CORRIDOR_PATH.includes(id);

  return (
    <div className="absolute inset-0 bg-[#e5e7eb]">
      <MapContainer 
        center={[26.9024, 75.7950]}  // Centered nicely
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Background Network (Huge Database Simulation) */}
        {BACKGROUND_EDGES.map((edge, idx) => (
          <Polyline 
            key={`bg-${idx}`} 
            positions={getPathArray(edge[0], edge[1])} 
            color="#334155" 
            weight={3} 
            opacity={0.15} 
          />
        ))}

        {/* Main Network Edges */}
        {MAIN_EDGES.map((edge, idx) => (
          <Polyline 
            key={`main-${idx}`} 
            positions={getPathArray(edge[0], edge[1])} 
            color="#0f172a" 
            weight={5} 
            opacity={0.3} 
          />
        ))}

        {/* Smart Routes */}
        {routeInfo && (
          <>
            <Polyline 
              positions={buildContinuousPath(routeInfo.standardRoute.path)} 
              color="#EF4444" 
              weight={6} 
              opacity={0.7} 
              dashArray="10, 10" 
            />
            <Polyline 
              positions={buildContinuousPath(routeInfo.smartRoute.path)} 
              color="#00FFA3" 
              weight={6} 
              opacity={0.9} 
            />
          </>
        )}

        {/* Emergency Corridor Override Highlight */}
        {emergencyActive && (
          <Polyline 
            positions={fullAmbRoute} 
            color="#00FFA3" 
            weight={8} 
            opacity={0.3} 
          />
        )}

        {/* Animated Object Simulation (Ambulance) */}
        {emergencyActive && fullAmbRoute.length > 0 && (
          <Marker position={ambPos} icon={ambulanceIcon} zIndexOffset={1000} />
        )}

        {/* Node Circles (Only Main Hubs) */}
        {nodes.map(node => {
          let color = '#22C55E';
          if (isEmergencyNode(node.id)) color = '#00FFA3';
          else if (node.signal === 'red') color = '#EF4444';
          else if (node.signal === 'yellow') color = '#F59E0B';

          // Ensure it's inside NODE_POSITIONS
          if (!NODE_POSITIONS[node.id]) return null;

          return (
            <CircleMarker 
              key={node.id}
              center={NODE_POSITIONS[node.id]} 
              radius={7} 
              pathOptions={{ fillColor: color, color: color, fillOpacity: 0.8, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <strong className="text-black">{node.id}</strong><br/>
                <span className="text-black/70">Density: {node.density}%</span><br/>
                <span className="text-black/70">Signal: {node.signal.toUpperCase()}</span>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Live Violations Mapping */}
        {alerts.slice(0, 1).map(alert => {
          const pos = NODE_POSITIONS[alert.location] || [26.9024, 75.7950];
          return (
            <Marker key={alert.id} position={pos} icon={alertIcon}>
              <Popup keepInView autoPan={false}>
                <div style={{ color: '#000', fontSize: '13px' }}>
                  <strong style={{ color: '#EF4444' }}>{alert.type}</strong><br/>
                  Vehicle: {alert.vehicleNumber}<br/>
                  Fine: ₹1000<br/>
                  <em>Camera Evidence Uploaded</em>
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>
    </div>
  );
}
