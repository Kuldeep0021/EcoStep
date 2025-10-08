import React from 'react';
import { FaLeaf, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px 0 20px',
      marginTop: '60px',
      textAlign: 'center'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          gap: '12px'
        }}>
          <FaLeaf size={24} style={{ color: '#28a745' }} />
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            Carbon Footprint Tracker
          </h3>
        </div>
        
        <p style={{ 
          marginBottom: '20px', 
          fontSize: '16px',
          opacity: 0.9,
          maxWidth: '600px',
          margin: '0 auto 20px'
        }}>
          Empowering individuals to track and reduce their environmental impact through 
          intelligent carbon footprint monitoring and sustainable living guidance.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          opacity: 0.8
        }}>
          <span>Made with</span>
          <FaHeart size={14} style={{ color: '#ff6b6b' }} />
          <span>by Kuldeep Yadav</span>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          paddingTop: '20px',
          fontSize: '14px',
          opacity: 0.7
        }}>
          © 2025 Carbon Footprint Tracker. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 