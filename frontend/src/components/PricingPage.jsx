import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const PricingPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const userInfo = await response.json();
        const success = await login(userInfo);
        if (success) {
          navigate('/workspace');
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    },
    onError: () => {
      console.error('Login Failed');
    },
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: 'white', paddingBottom: '5rem' }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', paddingTop: '5rem', paddingBottom: '3rem' }}>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#9ca3af', 
          marginBottom: '1.5rem',
          letterSpacing: '0.05em'
        }}>
          Simple usage-based plans for AI-assisted code generation
        </p>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          marginBottom: '1.5rem',
          lineHeight: '1.2'
        }}>
          Scale from side project to production<br />team
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#9ca3af', 
          maxWidth: '900px', 
          margin: '0 auto 2rem',
          lineHeight: '1.8'
        }}>
          Choose a plan that matches your workflow. All plans include access to the same
          code-generation models, with limits tailored to your team size.
        </p>
        
        {/* Billing Toggle */}
        <div style={{ 
          display: 'inline-flex', 
          backgroundColor: '#1f2937', 
          borderRadius: '9999px',
          padding: '0.25rem',
          gap: '0.25rem'
        }}>
          <button
            onClick={() => setBillingPeriod('monthly')}
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: billingPeriod === 'monthly' ? 'white' : 'transparent',
              color: billingPeriod === 'monthly' ? '#000' : '#9ca3af'
            }}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            style={{
              padding: '0.625rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: billingPeriod === 'yearly' ? 'white' : 'transparent',
              color: billingPeriod === 'yearly' ? '#000' : '#9ca3af'
            }}
          >
            Yearly · 2 months free
          </button>
        </div>

        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280', 
          marginTop: '1.5rem' 
        }}>
          No long-term contracts. Upgrade or downgrade in a few clicks from your dashboard.
        </p>
      </div>

      {/* Pricing Cards */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem'
      }}>
        {/* Starter Plan */}
        <div style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid #1f2937',
          borderRadius: '1rem',
          padding: '2.5rem',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Starter</h3>
              <span style={{
                padding: '0.375rem 0.875rem',
                backgroundColor: '#7c3aed',
                color: 'white',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                fontWeight: '600'
              }}>
                For individuals
              </span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Experiment with AI-assisted code generation on personal projects.
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Free
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>forever</div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '2rem' }}>
            Up to 5K tokens / day for non-commercial use.
          </p>

          <button
            onClick={isAuthenticated ? () => navigate('/workspace') : handleGoogleLogin}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'white',
              transition: 'all 0.2s',
              marginBottom: '2rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4b5563';
              e.currentTarget.style.backgroundColor = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Start for free
          </button>

          <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.5rem' }}>
            {[
              'Access to codegen-fast model',
              'Up to 3 active workspaces',
              'Basic chat history and search',
              'Community support'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <Check size={18} style={{ color: '#10b981', marginTop: '0.125rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: '1.5' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Plan */}
        <div style={{
          backgroundColor: '#0a0a0a',
          border: '2px solid #7c3aed',
          borderRadius: '1rem',
          padding: '2.5rem',
          position: 'relative',
          boxShadow: '0 0 50px rgba(124, 58, 237, 0.2)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#7c3aed',
            color: 'white',
            padding: '0.375rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            Most popular
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Pro</h3>
              <span style={{
                padding: '0.375rem 0.875rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                fontWeight: '600'
              }}>
                Most popular
              </span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.6' }}>
              For developers shipping features weekly and collaborating with a small team.
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              ${billingPeriod === 'yearly' ? '24' : '29'}
              <span style={{ fontSize: '1.25rem', fontWeight: 'normal', color: '#9ca3af' }}>
                {' '}per seat / month
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '2rem' }}>
            Includes 100K tokens / day per seat. Additional usage billed at metered rates.
          </p>

          <button
            onClick={isAuthenticated ? () => navigate('/workspace') : handleGoogleLogin}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: 'white',
              color: '#000',
              transition: 'all 0.2s',
              marginBottom: '2rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Upgrade to Pro
          </button>

          <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.5rem' }}>
            {[
              'Access to codegen-latest and codegen-fast',
              'Unlimited workspaces and pinned files',
              'Context-aware suggestions across files and repos',
              'Priority generation queues during peak hours',
              'Email support with 24h response targets'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <Check size={18} style={{ color: '#10b981', marginTop: '0.125rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: '1.5' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Plan */}
        <div style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid #1f2937',
          borderRadius: '1rem',
          padding: '2.5rem',
          position: 'relative'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Enterprise</h3>
              <span style={{
                padding: '0.375rem 0.875rem',
                backgroundColor: '#374151',
                color: 'white',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                fontWeight: '600'
              }}>
                For organizations
              </span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Custom limits, security, and support for larger engineering teams.
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Talk to us
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '2rem' }}>
            Tailored token pools, SSO, and deployment options for your company.
          </p>

          <button
            onClick={() => window.location.href = 'mailto:sales@codegen.ai'}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'white',
              transition: 'all 0.2s',
              marginBottom: '2rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4b5563';
              e.currentTarget.style.backgroundColor = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#374151';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Contact sales
          </button>

          <div style={{ borderTop: '1px solid #1f2937', paddingTop: '1.5rem' }}>
            {[
              'Custom token limits and dedicated capacity',
              'SSO/SAML, SCIM, and role-based access controls',
              'Centralized billing and usage analytics',
              'Dedicated success manager and support SLAs',
              'Optional private deployment and data retention controls'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <Check size={18} style={{ color: '#10b981', marginTop: '0.125rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#d1d5db', lineHeight: '1.5' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        maxWidth: '1200px',
        margin: '5rem auto 0',
        padding: '0 2rem'
      }}>
        <div style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid #1f2937',
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Need a custom setup or larger limits?
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
            We can align pricing to your usage patterns, compliance requirements, and existing tooling.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{
              padding: '0.875rem 1.5rem',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              color: 'white',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#374151'}
            >
              View full pricing guide →
            </button>
            <button style={{
              padding: '0.875rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: 'white',
              color: '#000',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Schedule a demo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;