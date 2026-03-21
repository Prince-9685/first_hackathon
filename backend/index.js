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
  'MNIT Jaipur', 'World Trade Park', 'Rajasthan University', 'Jhalana'
];

const EMERGENCY_CORRIDOR = ['Sindhi Camp', 'MI Road', 'SMS Hospital'];

// Utility for random numbers
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- Endpoints ---

// 1. /api/traffic-data
app.get('/api/traffic-data', (req, res) => {
  // Generate predictive intelligent simulation
  const nodes = MOCK_NODES.map(id => {
    // If emergency, completely override the traffic to minimum clear green
    if (emergencyCorridorActive && EMERGENCY_CORRIDOR.includes(id)) {
      return { id, density: 10, signal: 'green' };
    }
    
    // Adaptive logic from our engine
    const density = engine.predictTraffic(id);
    const signal = engine.getSignalState(density);

    return { id, density, signal };
  });

  res.json({ success: true, timestamp: new Date(), nodes, emergencyActive: emergencyCorridorActive });
});

// 2. /api/emergency
app.post('/api/emergency', (req, res) => {
  emergencyCorridorActive = true;
  globalMetrics.avgResponseTimeMin = 3.5; // Simulate improvement

  // Auto turn off after 30 seconds for demo purposes
  setTimeout(() => {
    emergencyCorridorActive = false;
  }, 30000);

  res.json({
    success: true,
    message: "Emergency Green Corridor Activated (Sindhi Camp -> SMS Hospital)",
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
  // Mock smart route vs regular route
  res.json({
    success: true,
    standardRoute: {
      path: ['Sindhi Camp', 'MI Road', 'Ajmeri Gate', 'Badi Choupad'],
      etaMins: 45,
      congestionLevel: 'High'
    },
    smartRoute: {
      path: ['Sindhi Camp', 'C-Scheme', 'Rambagh Circle', 'SMS Hospital', 'Badi Choupad'],
      etaMins: 28,
      congestionLevel: 'Low',
      note: "Avoided MI Road Congestion"
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
