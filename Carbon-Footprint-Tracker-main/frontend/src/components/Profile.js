import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaUser, FaLeaf, FaAward, FaTarget, FaChartLine, FaEdit } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    location: user?.profile?.location || '',
    goal: user?.carbonStats?.goal || 2000
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [achievementsRes, progressRes] = await Promise.all([
        axios.get('/api/users/achievements'),
        axios.get('/api/users/progress')
      ]);

      setAchievements(achievementsRes.data.achievements);
      setProgress(progressRes.data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setEditing(false);
        // Refresh profile data
        fetchProfileData();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-20">
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          <FaUser style={{ marginRight: '12px', color: '#667eea' }} />
          Profile
        </h1>
        <p style={{ color: '#666' }}>
          Manage your profile and track your environmental progress
        </p>
      </div>

      <div className="grid grid-2">
        {/* Profile Information */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
              <FaUser style={{ marginRight: '8px' }} />
              Profile Information
            </h3>
            <button
              onClick={() => setEditing(!editing)}
              className="btn btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              <FaEdit style={{ marginRight: '8px' }} />
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="City, Country"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Annual Carbon Goal (kg CO2)</label>
                <input
                  type="number"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Name:</strong> {user?.profile?.firstName} {user?.profile?.lastName}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Username:</strong> @{user?.username}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Email:</strong> {user?.email}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Location:</strong> {user?.profile?.location || 'Not specified'}
              </div>
              <div>
                <strong>Annual Goal:</strong> {user?.carbonStats?.goal} kg CO2
              </div>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <FaChartLine style={{ marginRight: '8px' }} />
            Progress Overview
          </h3>
          
          {progress && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Goal Progress</span>
                  <span>{progress.progress.toFixed(1)}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(progress.progress, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <div className="grid grid-2">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                    {progress.current.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Current (kg CO2)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                    {progress.goal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Goal (kg CO2)</div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <FaLeaf style={{ color: '#28a745', marginRight: '8px' }} />
                  Level {user?.carbonStats?.level}
                </div>
                <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                  {user?.carbonStats?.experience} experience points
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="card mt-20">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          <FaAward style={{ marginRight: '8px', color: '#FFD700' }} />
          Achievements
        </h3>
        
        {achievements.length > 0 ? (
          <div className="grid grid-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  background: '#f8f9fa',
                  textAlign: 'center'
                }}
              >
                <FaAward size={32} style={{ color: '#FFD700', marginBottom: '8px' }} />
                <div style={{ fontWeight: '600' }}>{achievement}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '40px', color: '#666' }}>
            <FaAward size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No achievements yet</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Start logging activities to earn achievements!
            </p>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="card mt-20">
        <h3 style={{ marginBottom: '20px' }}>Your Statistics</h3>
        <div className="grid grid-3">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {user?.carbonStats?.totalFootprint?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Footprint (kg CO2)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {user?.carbonStats?.weeklyAverage?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Weekly Average (kg CO2)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {user?.carbonStats?.monthlyAverage?.toFixed(2) || '0.00'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Monthly Average (kg CO2)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 