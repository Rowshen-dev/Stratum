import { useState } from 'react';
import { api, setToken } from '../api/api';

interface RegisterProps {
  onGoLogin: () => void;
}

export default function Register({ onGoLogin }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { username, email, password });
      const loginRes = await api.post('/auth/login', { email, password });
      const token = loginRes.data.access_token;
      localStorage.setItem('token', token);
      setToken(token);
      onGoLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRegister();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: '#111', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 13px', gap: 5 }}>
  <div style={{ width: 26, height: 4, background: 'white', borderRadius: 2 }} />
  <div style={{ width: 18, height: 4, background: 'white', borderRadius: 2, opacity: 0.6 }} />
  <div style={{ width: 12, height: 4, background: 'white', borderRadius: 2, opacity: 0.3 }} />
</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 6px', letterSpacing: -0.5 }}>
            Create account
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Join Stratum today</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 6 }}>
              Full name
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#888', marginTop: 24 }}>
          Already have an account?{' '}
          <span
            onClick={onGoLogin}
            style={{ color: '#111', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: '#f5f5f5',
  border: '1.5px solid transparent',
  borderRadius: 12,
  fontSize: 15,
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border 0.15s',
};