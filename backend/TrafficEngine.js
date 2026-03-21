/**
 * AI-Based Traffic Intelligence Engine (Pseudo-Trained Model)
 * Simulates intelligent traffic learning, peak hour calculations, and adaptive signaling.
 */

const EDGES = [
  ['Sindhi Camp', 'MI Road'], ['MI Road', 'Ajmeri Gate'], ['Ajmeri Gate', 'Badi Choupad'],
  ['Sindhi Camp', 'C-Scheme'], ['C-Scheme', 'Rambagh Circle'], ['Rambagh Circle', 'SMS Hospital'],
  ['SMS Hospital', 'Badi Choupad'], ['Ajmeri Gate', 'SMS Hospital'], ['MI Road', 'C-Scheme'],
  ['Vidhyadhar Nagar', 'Sindhi Camp'], ['Vaishali Nagar', 'Civil Lines'], ['Jhotwara', 'Vidhyadhar Nagar'],
  ['Civil Lines', 'C-Scheme'], ['Rambagh Circle', 'Raja Park'], ['Tonk Road', 'Malviya Nagar'],
  ['Mansarovar', 'Tonk Road'], ['Sanganer', 'Pratap Nagar'], ['Malviya Nagar', 'Pratap Nagar'],
  ['SMS Hospital', 'Raja Park'], ['Vaishali Nagar', 'Mansarovar'], ['Rajasthan University', 'MNIT Jaipur'],
  ['MNIT Jaipur', 'Jhalana'], ['Jhalana', 'World Trade Park'], ['Jhotwara', 'Vaishali Nagar'],
  ['Sindhi Camp', 'Civil Lines'], ['Raja Park', 'Rajasthan University'], ['World Trade Park', 'Malviya Nagar'],
  ['Pratap Nagar', 'Mansarovar'], ['Sanganer', 'Mansarovar'], ['Badi Choupad', 'Raja Park'],
  ['JDA Circle', 'Tonk Road'], ['JDA Circle', 'Malviya Nagar']
];

class TrafficEngine {
  constructor() {
    this.historyArray = {};
    this.baseTrafficLevels = {
      'MNIT Jaipur': 30, 'World Trade Park': 70, 'Rajasthan University': 40, 'Jhalana': 20,
      'Sindhi Camp': 80, 'MI Road': 65, 'Ajmeri Gate': 50, 'Badi Choupad': 80,
      'SMS Hospital': 45, 'Rambagh Circle': 55, 'C-Scheme': 35,
      'Vidhyadhar Nagar': 40, 'Mansarovar': 60, 'Vaishali Nagar': 55, 'Jhotwara': 45,
      'Raja Park': 65, 'Tonk Road': 75, 'Pratap Nagar': 50, 'Sanganer': 40,
      'Malviya Nagar': 70, 'Civil Lines': 30, 'JDA Circle': 55
    };

    // Each signal has its own phase offset (0–59 seconds) for staggered cycling
    this.signalPhaseOffsets = {};
    // Cycle durations adapt per node: busier intersections get longer red phases
    this.signalCycleDurations = {};

    const allNodes = Object.keys(this.baseTrafficLevels);
    allNodes.forEach((id, i) => {
      // Stagger each signal by a different offset so they don't all change together
      this.signalPhaseOffsets[id] = (i * 7) % 60;
      // Base cycle: 60s for low-traffic, up to 90s for high-traffic intersections
      const base = this.baseTrafficLevels[id];
      this.signalCycleDurations[id] = base > 60 ? 90 : base > 40 ? 75 : 60;
    });
  }

  // Calculates a time-based multiplier to simulate rush hours (9AM and 6PM)
  getTimeMultiplier() {
    const hour = new Date().getHours();
    // Peak hours: 8-10 AM and 17-19 PM
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
      return 1.8 + (Math.random() * 0.4); // 1.8x to 2.2x traffic during rush hour
    }
    // Off-peak (Night)
    if (hour >= 22 || hour <= 5) {
      return 0.3 + (Math.random() * 0.2); // Very low traffic at night
    }
    // Standard Day
    return 1.0 + (Math.random() * 0.3);
  }

  // Predicts current traffic density using pseudo-learning history and time
  predictTraffic(nodeId) {
    if (!this.historyArray[nodeId]) {
      this.historyArray[nodeId] = [];
    }

    const base = this.baseTrafficLevels[nodeId] || 30;
    const timeFactor = this.getTimeMultiplier();

    // Slight random deviation for realism
    let currentPrediction = Math.min(100, Math.max(5, base * timeFactor + (Math.random() * 15 - 7.5)));

    // Smooth with history (Pseudo-training effect: moving average)
    if (this.historyArray[nodeId].length > 0) {
      const recentAvg = this.historyArray[nodeId].reduce((a, b) => a + b, 0) / this.historyArray[nodeId].length;
      currentPrediction = (currentPrediction * 0.6) + (recentAvg * 0.4); // 60% new input, 40% historical weight
    }

    // Store in history
    this.historyArray[nodeId].push(currentPrediction);
    if (this.historyArray[nodeId].length > 10) this.historyArray[nodeId].shift(); // Keep last 10 ticks

    return Math.round(currentPrediction);
  }

  // Realistic Signal Cycling: Red → Green → Yellow → Red
  // Each node cycles independently with its own timing
  getSignalState(nodeId, density) {
    const cycleDuration = this.signalCycleDurations[nodeId] || 60;
    const offset = this.signalPhaseOffsets[nodeId] || 0;
    const now = Date.now() / 1000; // current time in seconds
    const phase = (now + offset) % cycleDuration;

    // Adaptive phase splits based on density:
    // High density → longer red, shorter green
    // Low density → longer green, shorter red
    let greenEnd, yellowEnd;
    if (density > 70) {
      // Heavy traffic: 20% green, 10% yellow, 70% red
      greenEnd = cycleDuration * 0.20;
      yellowEnd = cycleDuration * 0.30;
    } else if (density > 45) {
      // Moderate traffic: 40% green, 10% yellow, 50% red
      greenEnd = cycleDuration * 0.40;
      yellowEnd = cycleDuration * 0.50;
    } else {
      // Light traffic: 60% green, 8% yellow, 32% red
      greenEnd = cycleDuration * 0.60;
      yellowEnd = cycleDuration * 0.68;
    }

    if (phase < greenEnd) return 'green';
    if (phase < yellowEnd) return 'yellow';
    return 'red';
  }

  // Calculates the smartest route avoiding high density nodes
  getSmartRoute(availableNodes) {
    return availableNodes.filter(node => this.predictTraffic(node) < 75);
  }

  buildGraph() {
    const graph = {};
    const addEdge = (u, v) => {
      if (!graph[u]) graph[u] = [];
      graph[u].push(v);
    };
    EDGES.forEach(([u, v]) => {
      addEdge(u, v);
      addEdge(v, u);
    });
    return graph;
  }

  calculateRoute(start, end, optimizeTraffic = false) {
    if (start === end) return { path: [start], cost: 0, etaMins: 0 };
    const graph = this.buildGraph();
    const dist = {};
    const prev = {};
    const q = new Set();

    Object.keys(graph).forEach(node => {
      dist[node] = Infinity;
      prev[node] = null;
      q.add(node);
    });
    dist[start] = 0;

    let iterations = 0;
    while (q.size > 0 && iterations < 500) {
      iterations++;
      let u = null;
      for (const node of q) {
        if (u === null || dist[node] < dist[u]) u = node;
      }

      if (dist[u] === Infinity || u === end) break;
      q.delete(u);

      for (const neighbor of graph[u] || []) {
        if (!q.has(neighbor)) continue;

        // standard route counts purely stops (distance). Smart route brutally penalizes dense nodes!
        let weight = 1;
        if (optimizeTraffic) {
          const density = this.predictTraffic(neighbor);
          weight = density < 40 ? 1 : density < 75 ? 3 : 15;
        }

        const alt = dist[u] + weight;
        if (alt < dist[neighbor]) {
          dist[neighbor] = alt;
          prev[neighbor] = u;
        }
      }
    }

    const path = [];
    let curr = end;
    if (prev[curr] !== null || curr === start) {
      while (curr !== null) {
        path.unshift(curr);
        curr = prev[curr];
      }
    }

    if (path.length <= 1 && start !== end) {
      return { path: [start, end], etaMins: 99 };
    }

    const baseTimeMins = path.length * 6;
    const finalMins = optimizeTraffic ? Math.round(baseTimeMins * 0.9 + (dist[end] * 0.5)) : Math.round(baseTimeMins * 1.5 + dist[end]);

    return { path, etaMins: finalMins };
  }
}

module.exports = TrafficEngine;
