import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FaLeaf, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          opacity: 0.1
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          borderRadius: '50%',
          opacity: 0.1
        }} />

        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            borderRadius: '50%',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
          }}>
            <FaLeaf size={32} style={{ color: 'white' }} />
          </div>
          <h1 style={{ 
            fontSize: '32px', 
            marginBottom: '8px', 
            color: '#333',
            fontWeight: '700'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            color: '#555', 
            fontSize: '16px',
            lineHeight: '1.5',
            fontWeight: '500'
          }}>
            Track your carbon footprint and make a difference
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <FaEnvelope style={{ marginRight: '8px', color: '#667eea' }} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#f8f9fa'
              }}
              placeholder="Enter your email address"
              required
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.background = '#f8f9fa';
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <FaLock style={{ marginRight: '8px', color: '#667eea' }} />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#f8f9fa'
              }}
              placeholder="Enter your password"
              required
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.style.background = '#f8f9fa';
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }} />
                Logging in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              color: '#666', 
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.color = '#5a6fd8'}
              onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
          .login-container {
            padding: 16px;
          }
          
          .login-card {
            padding: 24px;
          }
          
          .login-title {
            font-size: 28px;
          }
          
          .login-subtitle {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login; 