/**
 * AI-Based Traffic Intelligence Engine (Pseudo-Trained Model)
 * Simulates intelligent traffic learning, peak hour calculations, and adaptive signaling.
 */

class TrafficEngine {
  constructor() {
    this.historyArray = {}; // In-memory database storing historical traffic trends per node
    this.baseTrafficLevels = {
      'MNIT Jaipur': 30, 'World Trade Park': 70, 'Rajasthan University': 40, 'Jhalana': 20,
      'Sindhi Camp': 80, 'MI Road': 65, 'Ajmeri Gate': 50, 'Badi Choupad': 80,
      'SMS Hospital': 45, 'Rambagh Circle': 55, 'C-Scheme': 35
    };
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

  // Adaptive Signal Logic
  getSignalState(density) {
    if (density > 80) return 'red';
    if (density > 50) return 'yellow';
    return 'green';
  }

  // Calculates the smartest route avoiding high density nodes
  getSmartRoute(availableNodes) {
    // Simply filter out nodes with density > 75
    return availableNodes.filter(node => this.predictTraffic(node) < 75);
  }
}

module.exports = TrafficEngine;
