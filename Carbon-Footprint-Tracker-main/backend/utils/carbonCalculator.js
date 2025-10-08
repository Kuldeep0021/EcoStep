// Carbon footprint calculation engine
// Emission factors in kg CO2 per unit

const emissionFactors = {
  transport: {
    car: {
      gasoline: 2.31, // kg CO2 per liter
      diesel: 2.68,   // kg CO2 per liter
      electric: 0.12, // kg CO2 per kWh
      hybrid: 1.5     // kg CO2 per liter (average)
    },
    bus: 0.105,       // kg CO2 per km
    train: 0.041,     // kg CO2 per km
    plane: 0.255,     // kg CO2 per km
    motorcycle: 0.103, // kg CO2 per km
    bicycle: 0,       // kg CO2 per km
    walking: 0        // kg CO2 per km
  },
  electricity: {
    grid: 0.5,        // kg CO2 per kWh (average)
    solar: 0.05,      // kg CO2 per kWh (manufacturing)
    wind: 0.01        // kg CO2 per kWh (manufacturing)
  },
  food: {
    beef: 13.3,       // kg CO2 per kg
    pork: 4.6,        // kg CO2 per kg
    chicken: 2.9,     // kg CO2 per kg
    fish: 3.0,        // kg CO2 per kg
    dairy: 1.4,       // kg CO2 per kg
    eggs: 1.4,        // kg CO2 per kg
    vegetables: 0.2,  // kg CO2 per kg
    fruits: 0.3,      // kg CO2 per kg
    grains: 0.5,      // kg CO2 per kg
    processed: 2.5    // kg CO2 per kg
  },
  waste: {
    plastic: 2.5,     // kg CO2 per kg
    paper: 0.8,       // kg CO2 per kg
    glass: 0.5,       // kg CO2 per kg
    metal: 1.5,       // kg CO2 per kg
    organic: 0.3      // kg CO2 per kg
  },
  shopping: {
    clothing: 23.0,   // kg CO2 per item
    electronics: 400,  // kg CO2 per device
    furniture: 50,     // kg CO2 per item
    books: 2.5        // kg CO2 per book
  }
};

class CarbonCalculator {
  static calculateTransport(activity, quantity, unit = 'km') {
    // Handle car with different fuel types
    if (activity === 'car') {
      // Default to gasoline if no specific fuel type
      const factor = emissionFactors.transport.car.gasoline;
      return factor * quantity;
    }
    
    const factor = emissionFactors.transport[activity] || 0;
    return factor * quantity;
  }

  static calculateElectricity(activity, quantity, unit = 'kWh') {
    const factor = emissionFactors.electricity[activity] || 0;
    return factor * quantity;
  }

  static calculateFood(activity, quantity, unit = 'kg') {
    const factor = emissionFactors.food[activity] || 0;
    return factor * quantity;
  }

  static calculateWaste(activity, quantity, unit = 'kg') {
    const factor = emissionFactors.waste[activity] || 0;
    return factor * quantity;
  }

  static calculateShopping(activity, quantity, unit = 'item') {
    const factor = emissionFactors.shopping[activity] || 0;
    return factor * quantity;
  }

  static calculateActivity(category, subcategory, activity, quantity, unit) {
    switch (category) {
      case 'transport':
        return this.calculateTransport(subcategory, quantity, unit);
      case 'electricity':
        return this.calculateElectricity(subcategory, quantity, unit);
      case 'food':
        return this.calculateFood(subcategory, quantity, unit);
      case 'waste':
        return this.calculateWaste(subcategory, quantity, unit);
      case 'shopping':
        return this.calculateShopping(subcategory, quantity, unit);
      default:
        return 0;
    }
  }

  static getSuggestions(category, currentFootprint) {
    const suggestions = {
      transport: [
        { action: 'Use public transportation', impact: -0.5, difficulty: 'medium' },
        { action: 'Carpool with colleagues', impact: -0.3, difficulty: 'easy' },
        { action: 'Walk or bike for short trips', impact: -0.8, difficulty: 'easy' },
        { action: 'Consider an electric vehicle', impact: -1.2, difficulty: 'hard' }
      ],
      electricity: [
        { action: 'Switch to LED bulbs', impact: -0.2, difficulty: 'easy' },
        { action: 'Use renewable energy', impact: -0.4, difficulty: 'medium' },
        { action: 'Unplug unused electronics', impact: -0.1, difficulty: 'easy' },
        { action: 'Install solar panels', impact: -0.8, difficulty: 'hard' }
      ],
      food: [
        { action: 'Reduce meat consumption', impact: -0.6, difficulty: 'medium' },
        { action: 'Buy local produce', impact: -0.3, difficulty: 'easy' },
        { action: 'Avoid food waste', impact: -0.4, difficulty: 'medium' },
        { action: 'Grow your own vegetables', impact: -0.2, difficulty: 'hard' }
      ],
      waste: [
        { action: 'Recycle more', impact: -0.3, difficulty: 'easy' },
        { action: 'Compost organic waste', impact: -0.2, difficulty: 'medium' },
        { action: 'Use reusable containers', impact: -0.1, difficulty: 'easy' },
        { action: 'Buy in bulk to reduce packaging', impact: -0.2, difficulty: 'medium' }
      ]
    };

    return suggestions[category] || [];
  }

  static calculateDailyAverage(activities) {
    if (!activities || activities.length === 0) return 0;
    
    const total = activities.reduce((sum, activity) => sum + activity.carbonFootprint, 0);
    const days = Math.max(1, (new Date() - new Date(activities[0].date)) / (1000 * 60 * 60 * 24));
    
    return total / days;
  }

  static calculateWeeklyAverage(activities) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyActivities = activities.filter(activity => 
      new Date(activity.date) >= weekAgo
    );
    
    return this.calculateDailyAverage(weeklyActivities) * 7;
  }

  static calculateMonthlyAverage(activities) {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const monthlyActivities = activities.filter(activity => 
      new Date(activity.date) >= monthAgo
    );
    
    return this.calculateDailyAverage(monthlyActivities) * 30;
  }
}

module.exports = CarbonCalculator; 