import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  // Google OAuth login handler
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('🎉 Google login success!');
      console.log('Access token:', tokenResponse.access_token);
      
      try {
        // Fetch user info from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.status}`);
        }
        
        const userInfo = await response.json();
        console.log('✅ User info received:', userInfo);
        
        // Pass userInfo to login which will send to backend
        const success = await login(userInfo);
        
        if (success) {
          console.log('✅ Login successful, navigating to workspace...');
          navigate('/workspace');
        } else {
          alert('Login failed. Please check the console for errors.');
        }
      } catch (error) {
        console.error('❌ Error during login:', error);
        alert(`Login failed: ${error.message}`);
      }
    },
    onError: (error) => {
      console.error('❌ Google Login Failed:', error);
      alert('Google login failed. Please try again.');
    },
  });

  if (isAuthenticated) {
    console.log('User already authenticated, redirecting to workspace...');
    navigate('/workspace');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: 'white' }}>
      {/* Hero Section */}
      <div className="hero" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '5rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1rem', color: '#e5e7eb', fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Code Generation Assistant
        </div>
        <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Build code faster with AI
        </h1>
        <p className="hero-subtitle" style={{ 
          maxWidth: '800px', 
          margin: '0 auto 2rem',
          fontSize: '1.25rem',
          color: '#e5e7eb'
        }}>
          Describe what you want to build in natural language and let the model
          generate high-quality, production-ready code snippets, tests, and refactors in
          seconds.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleGoogleLogin} 
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Try Now
          </button>
          <button 
            onClick={() => navigate('/docs')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
          >
            View Docs
          </button>
        </div>

        {/* Login Card */}
        <div style={{ 
          maxWidth: '450px', 
          margin: '0 auto',
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '16px',
          padding: '2rem',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Log in to start coding
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Access your workspaces, chat history, and personalized code suggestions.
          </p>

          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af', marginTop: '1rem' }}>
            New here?{' '}
            <button 
              onClick={handleGoogleLogin} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Sign up
            </button>
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            backgroundColor: 'rgba(59, 130, 246, 0.2)', 
            border: '1px solid rgba(59, 130, 246, 0.5)', 
            borderRadius: '8px' 
          }}>
            <p style={{ fontSize: '0.75rem', color: '#93c5fd', margin: 0 }}>
              ℹ️ Backend: {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#93c5fd', margin: 0, marginTop: '0.25rem' }}>
              Check browser console for login details
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem', backgroundColor: '#000' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{ 
            backgroundColor: '#1f2937', 
            border: '1px solid #374151', 
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white' 
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💻</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Refactor legacy code
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              Clean up a large file, add types, and improve structure without breaking behavior.
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#1f2937', 
            border: '1px solid #374151', 
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white' 
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Generate new API
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              Scaffold REST or GraphQL endpoints, including validation and tests.
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#1f2937', 
            border: '1px solid #374151', 
            borderRadius: '12px',
            padding: '1.5rem',
            color: 'white' 
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Explain this file
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
              Paste or attach code and get a clear walkthrough of how it works.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '5rem 2rem', 
        textAlign: 'center',
        backgroundColor: '#000'
      }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Ready to start coding?
        </h2>
        <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '2rem' }}>
          Join thousands of developers building faster with AI
        </p>
        <button
          onClick={handleGoogleLogin}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '50px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          <span>Get Started Free</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;