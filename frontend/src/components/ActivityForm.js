import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaLeaf, FaSave, FaCalculator } from 'react-icons/fa';

const ActivityForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    activity: '',
    quantity: '',
    unit: '',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [calculatedFootprint, setCalculatedFootprint] = useState(null);

  const categories = {
    transport: {
      label: 'Transport',
      subcategories: ['car', 'bus', 'train', 'plane', 'motorcycle', 'bicycle', 'walking'],
      units: ['km', 'miles']
    },
    electricity: {
      label: 'Electricity',
      subcategories: ['grid', 'solar', 'wind'],
      units: ['kWh']
    },
    food: {
      label: 'Food',
      subcategories: ['beef', 'pork', 'chicken', 'fish', 'dairy', 'eggs', 'vegetables', 'fruits', 'grains', 'processed'],
      units: ['kg', 'lbs']
    },
    waste: {
      label: 'Waste',
      subcategories: ['plastic', 'paper', 'glass', 'metal', 'organic'],
      units: ['kg', 'lbs']
    },
    shopping: {
      label: 'Shopping',
      subcategories: ['clothing', 'electronics', 'furniture', 'books'],
      units: ['item']
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset subcategory when category changes
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: '',
        unit: categories[value]?.units[0] || ''
      }));
      setCalculatedFootprint(null);
    }

    // Calculate footprint when quantity or subcategory changes
    if (name === 'quantity' || name === 'subcategory') {
      setTimeout(() => calculateFootprint(), 100);
    }
  };

  const calculateFootprint = () => {
    if (!formData.category || !formData.subcategory || !formData.quantity) {
      setCalculatedFootprint(null);
      return;
    }

    // Use the same emission factors as the backend
    const emissionFactors = {
      transport: {
        car: 2.31, bus: 0.105, train: 0.041, plane: 0.255, motorcycle: 0.103, bicycle: 0, walking: 0
      },
      electricity: { grid: 0.5, solar: 0.05, wind: 0.01 },
      food: { 
        beef: 13.3, pork: 4.6, chicken: 2.9, fish: 3.0, dairy: 1.4, eggs: 1.4, 
        vegetables: 0.2, fruits: 0.3, grains: 0.5, processed: 2.5 
      },
      waste: { plastic: 2.5, paper: 0.8, glass: 0.5, metal: 1.5, organic: 0.3 },
      shopping: { clothing: 23.0, electronics: 400, furniture: 50, books: 2.5 }
    };

    const factor = emissionFactors[formData.category]?.[formData.subcategory] || 0;
    const footprint = factor * parseFloat(formData.quantity);
    setCalculatedFootprint(Math.round(footprint * 100) / 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subcategory || !formData.activity || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/activities', formData);
      toast.success('Activity logged successfully!');
      
      // Navigate to dashboard without forcing reload
      navigate('/dashboard');
    } catch (error) {
      console.error('Activity submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-20">
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          <FaLeaf style={{ marginRight: '12px', color: '#28a745' }} />
          Log Activity
        </h1>
        <p style={{ color: '#666' }}>
          Track your daily activities and their environmental impact
        </p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select category</option>
                {Object.entries(categories).map(([key, category]) => (
                  <option key={key} value={key}>{category.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subcategory *</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="form-select"
                required
                disabled={!formData.category}
              >
                <option value="">Select subcategory</option>
                {formData.category && categories[formData.category]?.subcategories.map(sub => (
                  <option key={sub} value={sub}>
                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Description *</label>
            <input
              type="text"
              name="activity"
              value={formData.activity}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Drove to work, Ate beef burger, etc."
              required
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter quantity"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select unit</option>
                {formData.category && categories[formData.category]?.units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Home, Office, City"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-input"
              placeholder="Additional notes about this activity"
              rows="3"
            />
          </div>

          {calculatedFootprint !== null && (
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div className="text-center">
                <FaCalculator size={24} style={{ color: '#28a745', marginBottom: '8px' }} />
                <h4 style={{ color: '#28a745', marginBottom: '4px' }}>
                  Estimated Carbon Footprint
                </h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {calculatedFootprint} kg CO2
                </p>
              </div>
            </div>
          )}

          <div className="flex" style={{ gap: '12px' }}>
            <button
              type="button"
              onClick={calculateFootprint}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={!formData.category || !formData.subcategory || !formData.quantity}
            >
              <FaCalculator style={{ marginRight: '8px' }} />
              Calculate Footprint
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading || !formData.category || !formData.subcategory || !formData.activity || !formData.quantity}
            >
              {loading ? (
                <>
                  <FaSave style={{ marginRight: '8px' }} />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave style={{ marginRight: '8px' }} />
                  Log Activity
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm; 