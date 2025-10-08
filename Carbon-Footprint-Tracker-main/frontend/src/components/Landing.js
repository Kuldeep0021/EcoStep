import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaChartLine, FaLightbulb, FaUsers, FaGlobe, FaBullseye } from 'react-icons/fa';

const Landing = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Hero Section */}
      <div style={{ 
        padding: '80px 20px 60px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <FaLeaf size={48} style={{ color: '#28a745', marginRight: '16px' }} />
          <h1 style={{ fontSize: '48px', fontWeight: '700', margin: 0 }}>
            Carbon Footprint Tracker
          </h1>
        </div>
        
        <p style={{ 
          fontSize: '20px', 
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px',
          lineHeight: '1.6'
        }}>
          Empowering individuals to understand, track, and reduce their environmental impact 
          through intelligent carbon footprint monitoring and sustainable living guidance.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            padding: '16px 32px',
            background: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
          }}
          >
            Get Started
          </Link>
          
          <Link to="/login" style={{
            padding: '16px 32px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            border: '2px solid rgba(255,255,255,0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
          }}
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ 
        background: 'white',
        padding: '80px 20px',
        color: '#333'
      }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '36px', 
            marginBottom: '60px',
            color: '#333'
          }}>
            What We Do
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
              }}>
                <FaChartLine size={32} style={{ color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>
                Track Your Impact
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
                Log your daily activities and automatically calculate your carbon footprint. 
                From transportation to food choices, we help you understand your environmental impact.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
              }}>
                <FaLightbulb size={32} style={{ color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>
                Get Smart Suggestions
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
                Receive personalized recommendations to reduce your carbon footprint. 
                Discover eco-friendly alternatives and sustainable living tips.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
              }}>
                <FaUsers size={32} style={{ color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>
                Join the Community
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
                Compare your progress with others, participate in challenges, 
                and be part of a community committed to environmental sustainability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About Carbon Footprint Section */}
      <div style={{ 
        background: '#f8f9fa',
        padding: '80px 20px',
        color: '#333'
      }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '36px', 
            marginBottom: '60px',
            color: '#333'
          }}>
            Understanding Carbon Footprint
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '40px'
          }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center' }}>
                <FaGlobe style={{ marginRight: '12px', color: '#28a745' }} />
                What is Carbon Footprint?
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666', marginBottom: '16px' }}>
                A carbon footprint is the total amount of greenhouse gases (primarily carbon dioxide) 
                emitted directly and indirectly by your daily activities. It's measured in kilograms of CO2 equivalent.
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
                Every action we take - from driving a car to eating a meal - contributes to our carbon footprint. 
                Understanding this impact is the first step toward making sustainable choices.
              </p>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '16px', color: '#333', display: 'flex', alignItems: 'center' }}>
                <FaBullseye style={{ marginRight: '12px', color: '#007bff' }} />
                Why Track It?
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666', marginBottom: '16px' }}>
                Climate change is one of the biggest challenges facing our planet. By tracking your carbon footprint, 
                you can identify the activities that have the greatest environmental impact.
              </p>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
                Small changes in daily habits can lead to significant reductions in your carbon footprint, 
                helping to protect our environment for future generations.
              </p>
            </div>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            padding: '40px',
            borderRadius: '12px',
            marginTop: '40px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '28px', marginBottom: '16px' }}>
              Ready to Make a Difference?
            </h3>
            <p style={{ fontSize: '18px', marginBottom: '24px', opacity: 0.9 }}>
              Join thousands of people who are already tracking and reducing their carbon footprint.
            </p>
            <Link to="/register" style={{
              padding: '16px 32px',
              background: 'white',
              color: '#28a745',
              textDecoration: 'none',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 