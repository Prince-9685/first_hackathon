const express = require('express');
const cors = require('cors');
const TrafficEngine = require('./TrafficEngine');

const app = express();
const PORT = process.env.PORT || 5000;
const engine = new TrafficEngine();

app.use(cors());
app.use(express.json());

// --- Mock State ---
let emergencyCorridorActive = false;
let globalMetrics = {
  efficiency: 85,
  congestionReduced: 25,
  violationsDetected: 142,
  avgResponseTimeMin: 4.2
};

let recentViolations = [];
let recentChallans = [];

const MOCK_NODES = [
  'Sindhi Camp', 'MI Road', 'Ajmeri Gate', 'Badi Choupad', 'SMS Hospital', 'Rambagh Circle', 'C-Scheme',
  'MNIT Jaipur', 'World Trade Park', 'Rajasthan University', 'Jhalana',
  'Vidhyadhar Nagar', 'Mansarovar', 'Vaishali Nagar', 'Jhotwara', 'Raja Park', 'Tonk Road', 
  'Pratap Nagar', 'Sanganer', 'Malviya Nagar', 'Civil Lines', 'JDA Circle'
];

let EMERGENCY_CORRIDOR = ['Sindhi Camp', 'MI Road', 'SMS Hospital'];

// Utility for random numbers
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Endpoints ---

// 1. /api/traffic-data
app.get('/api/traffic-data', (req, res) => {
  // Generate predictive intelligent simulation
  const nodes = MOCK_NODES.map(id => {
    // If emergency, completely override the traffic to minimum clear green
    if (emergencyCorridorActive && EMERGENCY_CORRIDOR.includes(id)) {
      return { id, density: 10, signal: 'green', signalTimer: 30 };
    }
    
    // Adaptive logic from our engine
    const density = engine.predictTraffic(id);
    const signal = engine.getSignalState(id, density);

    // Compute remaining seconds in current phase for UI countdown
    const cycleDuration = engine.signalCycleDurations[id] || 60;
    const offset = engine.signalPhaseOffsets[id] || 0;
    const now = Date.now() / 1000;
    const phase = (now + offset) % cycleDuration;
    let greenEnd, yellowEnd;
    if (density > 70) { greenEnd = cycleDuration * 0.20; yellowEnd = cycleDuration * 0.30; }
    else if (density > 45) { greenEnd = cycleDuration * 0.40; yellowEnd = cycleDuration * 0.50; }
    else { greenEnd = cycleDuration * 0.60; yellowEnd = cycleDuration * 0.68; }
    let signalTimer;
    if (phase < greenEnd) signalTimer = Math.ceil(greenEnd - phase);
    else if (phase < yellowEnd) signalTimer = Math.ceil(yellowEnd - phase);
    else signalTimer = Math.ceil(cycleDuration - phase);

    return { id, density, signal, signalTimer };
  });

  res.json({ success: true, timestamp: new Date(), nodes, emergencyActive: emergencyCorridorActive, emergencyCorridor: EMERGENCY_CORRIDOR });
});

// 2. /api/emergency
app.post('/api/emergency', (req, res) => {
  const { start, end } = req.body;
  if (start && end) {
    const route = engine.calculateRoute(start, end, false);
    EMERGENCY_CORRIDOR = route.path;
  }

  emergencyCorridorActive = true;
  globalMetrics.avgResponseTimeMin = 3.5; // Simulate improvement

  // Auto turn off after 30 seconds for demo purposes
  setTimeout(() => {
    emergencyCorridorActive = false;
  }, 30000);

  res.json({
    success: true,
    message: `Emergency Green Corridor Activated (${start || 'Sindhi Camp'} -> ${end || 'SMS Hospital'})`,
    corridor: EMERGENCY_CORRIDOR
  });
});

// 3. /api/violation
app.post('/api/violation', (req, res) => {
  const types = ["Red Light Jump", "Over-speeding", "No Helmet", "Wrong Way"];
  const type = types[Math.floor(Math.random() * types.length)];
  const location = MOCK_NODES[Math.floor(Math.random() * MOCK_NODES.length)];
  
  const violation = {
    id: `VIO-${Date.now().toString().slice(-6)}`,
    type,
    location,
    timestamp: new Date().toISOString(),
    vehicleNumber: `RJ-14-${getRandomInt(10, 40)}-${getRandomInt(1000, 9999)}`,
    confidence: getRandomInt(85, 99)
  };

  recentViolations.unshift(violation);
  if (recentViolations.length > 20) recentViolations.pop();

  globalMetrics.violationsDetected++;

  res.json({ success: true, violation });
});

// 4. /api/challan
app.post('/api/challan', (req, res) => {
  const { violationId } = req.body;
  const violation = recentViolations.find(v => v.id === violationId);
  
  if (!violation) {
    return res.status(404).json({ success: false, message: "Violation not found" });
  }

  const challan = {
    challanId: `CHL-${Date.now().toString().slice(-6)}`,
    violationId: violation.id,
    amount: getRandomInt(5, 20) * 100, // 500 to 2000
    issuedAt: new Date().toISOString(),
    status: 'Pending'
  };

  recentChallans.unshift(challan);
  if (recentChallans.length > 20) recentChallans.pop();

  res.json({ success: true, challan });
});

// 5. /api/route
app.get('/api/route', (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ success: false, message: "Missing start or end query parameters" });
  }

  const standard = engine.calculateRoute(start, end, false);
  const smart = engine.calculateRoute(start, end, true);

  res.json({
    success: true,
    standardRoute: {
      path: standard.path,
      etaMins: standard.etaMins,
      congestionLevel: 'High'
    },
    smartRoute: {
      path: smart.path,
      etaMins: smart.etaMins,
      congestionLevel: 'Low',
      note: standard.path.join() === smart.path.join() ? "Direct path is highly optimal" : "AI intelligently bypassed heavily congested hotspots"
    }
  });
});

// 6. /api/metrics
app.get('/api/metrics', (req, res) => {
  // Add some slight randomness to make metrics look "live"
  const currentMetrics = {
    ...globalMetrics,
    efficiency: Math.min(100, globalMetrics.efficiency + getRandomInt(-2, 2)),
    vehiclesProcessed: getRandomInt(10000, 15000)
  };
  
  res.json({ success: true, metrics: currentMetrics, recentViolations: recentViolations.slice(0, 5) });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Smart Traffic Backend MVP running on http://localhost:${PORT}`);
});
