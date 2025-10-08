import React from 'react';
import { FaLeaf } from 'react-icons/fa';

const Loading = () => {
  return (
    <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <FaLeaf size={48} style={{ color: '#28a745', marginBottom: '16px', animation: 'spin 2s linear infinite' }} />
        <p style={{ color: '#666', fontSize: '18px' }}>Loading...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default Loading; 