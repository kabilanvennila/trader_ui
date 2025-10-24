import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just call onLogin to skip to app
    onLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      position: 'relative'
    }}>
      {/* Grid Background - Centered 1280px container, then extend outward */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        {/* Center 1280px grid (16 columns) */}
        <div style={{
          width: '1280px',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px, transparent 80px)`,
          backgroundSize: '1280px 100%',
          backgroundPosition: 'left top',
          backgroundRepeat: 'no-repeat'
        }} />
        
        {/* Left extension - start from 80px before center grid */}
        <div style={{
          position: 'absolute',
          right: 'calc(50% + 640px)',
          width: '50vw',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px, transparent 80px)`,
          backgroundPosition: 'right top'
        }} />
        
        {/* Right extension */}
        <div style={{
          position: 'absolute',
          left: 'calc(50% + 640px)',
          width: '50vw',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px, transparent 80px)`
        }} />
      </div>

      {/* Login Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'white',
        width: '480px',
        boxSizing: 'border-box',
        borderTop: '1px dashed #DEE2E8',
        borderBottom: '1px dashed #DEE2E8',
        borderLeft: '1px solid rgba(217, 217, 217, 0.5)'
      }}>
        {/* Logo/Branding - Edge to Edge */}
        <img 
          src="/branding.png" 
          alt="in the zone trader" 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        
        {/* Content with padding */}
        <div style={{ padding: '40px 48px 48px 48px' }}>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            fontFamily: 'Inter, sans-serif',
            margin: '0 0 40px 0',
            textAlign: 'center'
          }}>
            Sign in to your account
          </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1E3F66'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1E3F66'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              color: 'white',
              backgroundColor: '#1E3F66',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2C5F8D'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3F66'}
          >
            Sign In
          </button>

          {/* Forgot Password Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <a href="#" style={{
              fontSize: '14px',
              color: '#1E3F66',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500'
            }}>
              Forgot password?
            </a>
          </div>
        </form>

          {/* Temporary Skip Button (for testing) */}
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <button
              onClick={onLogin}
              style={{
                fontSize: '14px',
                color: '#6B7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                textDecoration: 'underline'
              }}
            >
              Skip to app (testing)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
