import { useState } from 'react';
import { api, setToken } from '../api/api';

interface LoginProps {
  onSuccess: () => void;
  onGoRegister: () => void;
}

export default function Login({ onSuccess, onGoRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      setToken(token);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: '#111', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 13px', gap: 5 }}>
  <div style={{ width: 26, height: 4, background: 'white', borderRadius: 2 }} />
  <div style={{ width: 18, height: 4, background: 'white', borderRadius: 2, opacity: 0.6 }} />
  <div style={{ width: 12, height: 4, background: 'white', borderRadius: 2, opacity: 0.3 }} />
</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: -0.5 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Sign in to Stratum</p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#111', marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>Password</label>
              <span style={{ fontSize: 13, color: '#888', cursor: 'pointer' }}>Forgot?</span>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              height: 48,
              background: loading ? '#666' : '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#888', marginTop: 24 }}>
          Don't have an account?{' '}
          <span
            onClick={onGoRegister}
            style={{ color: '#111', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 48,
  padding: '0 14px',
  background: '#f5f5f5',
  border: '1px solid transparent',
  borderRadius: 12,
  fontSize: 15,
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};