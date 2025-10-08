import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaTrophy, FaMedal, FaCrown, FaLeaf } from 'react-icons/fa';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const [leaderboardRes, rankingRes] = await Promise.all([
        axios.get('/api/leaderboard'),
        axios.get('/api/leaderboard/my-ranking')
      ]);

      setLeaderboard(leaderboardRes.data.leaderboard);
      setMyRanking(rankingRes.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown style={{ color: '#FFD700' }} />;
    if (rank === 2) return <FaMedal style={{ color: '#C0C0C0' }} />;
    if (rank === 3) return <FaMedal style={{ color: '#CD7F32' }} />;
    return <FaTrophy />;
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-20">
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
          <FaTrophy style={{ marginRight: '12px', color: '#FFD700' }} />
          Leaderboard
        </h1>
        <p style={{ color: '#666' }}>
          Compare your carbon footprint with other eco-conscious users
        </p>
      </div>

      {/* My Ranking */}
      {myRanking && (
        <div className="card mb-20" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <div className="text-center">
            <h3 style={{ marginBottom: '12px' }}>Your Ranking</h3>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              #{myRanking.rank}
            </div>
            <p style={{ marginBottom: '8px' }}>
              Out of {myRanking.totalUsers} users
            </p>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>
              Top {myRanking.percentile}% • {myRanking.totalFootprint.toFixed(2)} kg CO2 total
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Top Eco Warriors</h3>
        
        {leaderboard.length > 0 ? (
          <div>
            {leaderboard.map((user, index) => (
              <div
                key={user.username}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderBottom: index < leaderboard.length - 1 ? '1px solid #e9ecef' : 'none',
                  background: index < 3 ? '#f8f9fa' : 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ marginRight: '16px', fontSize: '20px', fontWeight: 'bold', color: index < 3 ? '#FFD700' : '#666' }}>
                    {getRankIcon(user.rank)}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {user.firstName} {user.lastName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      @{user.username}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#28a745', fontSize: '18px' }}>
                    {user.totalFootprint.toFixed(2)} kg CO2
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Level {user.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ padding: '40px', color: '#666' }}>
            <FaTrophy size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card mt-20">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <FaLeaf style={{ marginRight: '8px', color: '#28a745' }} />
          Tips to Improve Your Ranking
        </h3>
        <div className="grid grid-2">
          <div>
            <h4 style={{ marginBottom: '8px', color: '#28a745' }}>Transport</h4>
            <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
              <li>Use public transportation</li>
              <li>Walk or bike for short trips</li>
              <li>Carpool with colleagues</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '8px', color: '#28a745' }}>Food & Lifestyle</h4>
            <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
              <li>Reduce meat consumption</li>
              <li>Buy local produce</li>
              <li>Minimize food waste</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 