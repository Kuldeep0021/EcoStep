import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaTrash, FaEdit, FaPlus, FaCalendar, FaLeaf } from 'react-icons/fa';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [currentPage, filter]);

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (filter !== 'all') {
        params.append('category', filter);
      }

      const response = await axios.get(`/api/activities?${params}`);
      setActivities(response.data.activities);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await axios.delete(`/api/activities/${activityId}`);
        toast.success('Activity deleted successfully!');
        fetchActivities(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete activity');
      }
    }
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0.00';
    return Math.round(num * 100) / 100;
  };

  const getCategoryColor = (category) => {
    const colors = {
      transport: '#007bff',
      electricity: '#28a745',
      food: '#ffc107',
      waste: '#dc3545',
      shopping: '#6f42c1',
      other: '#6c757d'
    };
    return colors[category] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading activities...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-20">
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          <FaCalendar style={{ marginRight: '12px', color: '#667eea' }} />
          My Activities
        </h1>
        <p style={{ color: '#666' }}>
          View and manage all your logged activities
        </p>
      </div>

      {/* Filter and Add Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value="all">All Categories</option>
            <option value="transport">Transport</option>
            <option value="electricity">Electricity</option>
            <option value="food">Food</option>
            <option value="waste">Waste</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Link to="/activity" className="btn btn-primary">
          <FaPlus style={{ marginRight: '8px' }} />
          Log New Activity
        </Link>
      </div>

      {/* Activities List */}
      <div className="card">
        {activities.length > 0 ? (
          <div>
            {activities.map((activity, index) => (
              <div
                key={activity._id}
                style={{
                  padding: '20px',
                  borderBottom: index < activities.length - 1 ? '1px solid #e9ecef' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '8px',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: getCategoryColor(activity.category)
                    }} />
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {activity.activity}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <span style={{
                      padding: '4px 8px',
                      background: getCategoryColor(activity.category),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {activity.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{activity.quantity} {activity.unit}</span>
                  </div>
                  
                  {activity.notes && (
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '14px', 
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      "{activity.notes}"
                    </div>
                  )}
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px'
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      color: '#28a745' 
                    }}>
                      {formatNumber(activity.carbonFootprint)} kg CO2
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Carbon Footprint
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(activity._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                      color: '#dc3545',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    title="Delete Activity"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '20px',
                padding: '20px 0'
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Previous
                </button>
                
                <span style={{ padding: '8px 16px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <FaLeaf size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '8px' }}>No activities found</h3>
            <p style={{ marginBottom: '20px' }}>
              {filter === 'all' 
                ? "You haven't logged any activities yet." 
                : `No activities found in the ${filter} category.`
              }
            </p>
            <Link to="/activity" className="btn btn-primary">
              <FaPlus style={{ marginRight: '8px' }} />
              Log Your First Activity
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities; 