import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="nav">
      <div style={{ 
        maxWidth: '1400px', 
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <Link to="/" className="nav-logo">
            CodeGen AI
          </Link>
          <div style={{ display: 'flex', gap: '2rem' }} className="desktop-menu">
            <Link to="/" className="nav-link">Product</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/docs" className="nav-link">Docs</Link>
            {isAuthenticated && (
              <Link to="/workspace" className="nav-link">Dashboard</Link>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-menu">
          {isAuthenticated ? (
            <>
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%'
                  }}
                />
              )}
              <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem'
                }}
                className="nav-link"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/" className="nav-link" style={{ padding: '0.5rem 1rem' }}>
              Log in
            </Link>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          backgroundColor: '#1f2937',
          borderTop: '1px solid #374151',
          padding: '1rem'
        }}>
          <Link to="/" className="nav-link" style={{ display: 'block', padding: '0.5rem' }}>
            Product
          </Link>
          <Link to="/pricing" className="nav-link" style={{ display: 'block', padding: '0.5rem' }}>
            Pricing
          </Link>
          <Link to="/docs" className="nav-link" style={{ display: 'block', padding: '0.5rem' }}>
            Docs
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/workspace" className="nav-link" style={{ display: 'block', padding: '0.5rem' }}>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  padding: '0.5rem',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                Sign out
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;