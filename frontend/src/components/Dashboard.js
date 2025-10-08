import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FaLeaf, FaChartLine, FaTrophy, FaBullseye, 
  FaCalendar, FaPlus, FaLightbulb, FaAward 
} from 'react-icons/fa';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Set up interval to refresh data every 10 seconds for better real-time updates
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes, suggestionsRes, userRes] = await Promise.all([
        axios.get('/api/activities/stats'),
        axios.get('/api/activities?limit=5'),
        axios.get('/api/activities/suggestions'),
        axios.get('/api/auth/profile')
      ]);

      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data.activities);
      setSuggestions(suggestionsRes.data.suggestions);
      
      // Update user data with latest stats
      if (userRes.data) {
        updateUser(userRes.data);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0.00';
    return Math.round(num * 100) / 100;
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  // Use stats from API instead of user object for more accurate data
  const totalFootprint = stats?.totalFootprint || 0;
  const weeklyAverage = stats?.weeklyAverage || 0;
  const monthlyAverage = stats?.monthlyAverage || 0;
  const userGoal = user?.carbonStats?.goal || 1000; // Default goal

  const categoryData = stats?.categoryStats ? 
    Object.entries(stats.categoryStats).map(([category, data]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: data.total,
      color: COLORS[Object.keys(stats.categoryStats).indexOf(category) % COLORS.length]
    })) : [];

  return (
    <div>
      <div className="text-center mb-20">
        <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#333' }}>
          Welcome back, {user?.profile?.firstName || user?.username}!
        </h1>
        <p style={{ color: '#fff', fontSize: '18px', marginBottom: '20px' }}>
          Track your carbon footprint and make a positive impact on our planet
        </p>
      </div>

      {/* Carbon Footprint Information */}
      <div className="card mb-20" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <h3 style={{ marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center' }}>
          <FaLeaf style={{ marginRight: '8px', color: '#28a745' }} />
          What is Carbon Footprint?
        </h3>
        <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#555' }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>Carbon Footprint</strong> is the total amount of greenhouse gases (primarily carbon dioxide) 
            emitted directly and indirectly by your daily activities. It's measured in kilograms of CO2 equivalent.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <strong style={{ color: '#28a745' }}>🌍 Environmental Impact:</strong>
              <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                Every activity contributes to climate change. Understanding your footprint helps you make informed decisions.
              </p>
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <strong style={{ color: '#007bff' }}>📊 Track & Reduce:</strong>
              <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                Monitor your daily activities and discover ways to reduce your environmental impact.
              </p>
            </div>
            <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <strong style={{ color: '#ffc107' }}>🎯 Sustainable Living:</strong>
              <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
                Get personalized suggestions to adopt eco-friendly habits and reduce your carbon footprint.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Carbon Footprint Overview */}
      <div className="grid grid-3 mb-20">
        <div className="card text-center">
          <FaLeaf size={32} style={{ color: '#28a745', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>
            {formatNumber(totalFootprint)} kg CO2
          </h3>
          <p style={{ color: '#666' }}>Total Footprint</p>
        </div>

        <div className="card text-center">
          <FaChartLine size={32} style={{ color: '#007bff', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>
            {formatNumber(weeklyAverage)} kg CO2
          </h3>
          <p style={{ color: '#666' }}>Weekly Average</p>
        </div>

        <div className="card text-center">
          <FaBullseye size={32} style={{ color: '#ffc107', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>
            {formatNumber(userGoal)} kg CO2
          </h3>
          <p style={{ color: '#666' }}>Annual Goal</p>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Category Breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <FaChartLine style={{ marginRight: '8px' }} />
            Category Breakdown
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center" style={{ padding: '40px', color: '#666' }}>
              <FaLeaf size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No activities logged yet</p>
              <Link to="/activity" className="btn btn-primary mt-20">
                <FaPlus style={{ marginRight: '8px' }} />
                Log Your First Activity
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <FaCalendar style={{ marginRight: '8px' }} />
            Recent Activities
          </h3>
          {recentActivities.length > 0 ? (
            <div>
              {recentActivities.map((activity, index) => (
                <div
                  key={activity._id}
                  style={{
                    padding: '12px 0',
                    borderBottom: index < recentActivities.length - 1 ? '1px solid #e9ecef' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>{activity.activity}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {activity.category} • {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: '#28a745' }}>
                    {formatNumber(activity.carbonFootprint)} kg CO2
                  </div>
                </div>
              ))}
              <Link to="/activities" className="btn btn-secondary" style={{ marginTop: '16px', width: '100%' }}>
                View All Activities
              </Link>
            </div>
          ) : (
            <div className="text-center" style={{ padding: '40px', color: '#666' }}>
              <FaCalendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>No activities yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="card mt-20">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <FaLightbulb style={{ marginRight: '8px' }} />
            Eco-Friendly Suggestions
          </h3>
          <div className="grid grid-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  background: '#f8f9fa'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                  {suggestion.action}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Impact: {suggestion.impact} kg CO2/day
                </div>
                <div style={{ fontSize: '12px', color: '#28a745', marginTop: '4px' }}>
                  Difficulty: {suggestion.difficulty}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mt-20">
        <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
        <div className="grid grid-3">
          <Link to="/activity" className="btn btn-primary" style={{ textAlign: 'center' }}>
            <FaPlus style={{ marginRight: '8px' }} />
            Log Activity
          </Link>
          <Link to="/leaderboard" className="btn btn-secondary" style={{ textAlign: 'center' }}>
            <FaTrophy style={{ marginRight: '8px' }} />
            View Leaderboard
          </Link>
          <Link to="/profile" className="btn btn-secondary" style={{ textAlign: 'center' }}>
            <FaAward style={{ marginRight: '8px' }} />
            View Achievements
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 