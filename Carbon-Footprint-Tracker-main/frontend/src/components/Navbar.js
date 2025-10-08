import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf, FaUser, FaSignOutAlt, FaChartBar, FaTrophy, FaPlus } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '16px 0',
      marginBottom: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '20px'
        }}>
          {/* Left Section - Symbol */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                <FaLeaf size={24} style={{ color: 'white' }} />
              </div>
            </Link>
          </div>

          {/* Center Section - Project Name */}
          <div style={{ textAlign: 'center' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#333',
                margin: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Carbon Footprint Tracker
              </h1>
            </Link>
          </div>

          {/* Right Section - Profile & Actions */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            gap: '16px'
          }}>
            <Link to="/activity" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
            >
              <FaPlus style={{ marginRight: '8px' }} />
              Log Activity
            </Link>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease',
                  border: '2px solid #e9ecef',
                  background: '#f8f9fa'
                }}
                onMouseEnter={(e) => {
                  setShowMenu(true);
                  e.target.style.borderColor = '#667eea';
                  e.target.style.background = 'white';
                }}
                onMouseLeave={() => setShowMenu(false)}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {(user?.profile?.firstName || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: '600', color: '#333' }}>
                  {user?.profile?.firstName || user?.username}
                </span>
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '4px solid #666',
                  transition: 'transform 0.3s ease'
                }}
                className={showMenu ? 'rotate-180' : ''}
                />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    minWidth: '220px',
                    zIndex: 1000,
                    marginTop: '8px',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={() => setShowMenu(true)}
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #e9ecef',
                    background: '#f8f9fa'
                  }}>
                    <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                      {user?.profile?.firstName} {user?.profile?.lastName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {user?.email}
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#333',
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <FaUser style={{ marginRight: '12px', color: '#667eea' }} />
                    Profile
                  </Link>
                  
                  <Link
                    to="/dashboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#333',
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <FaChartBar style={{ marginRight: '12px', color: '#667eea' }} />
                    Dashboard
                  </Link>
                  
                  <Link
                    to="/leaderboard"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      textDecoration: 'none',
                      color: '#333',
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <FaTrophy style={{ marginRight: '12px', color: '#667eea' }} />
                    Leaderboard
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#dc3545',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <FaSignOutAlt style={{ marginRight: '12px' }} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 