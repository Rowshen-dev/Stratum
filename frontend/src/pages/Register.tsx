import { useState } from 'react';
import { api } from '../api/api';

interface RegisterProps {
  onGoLogin: () => void;
}

export default function Register({ onGoLogin }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { username, email, password });
      alert('Аккаунт создан! Войдите в систему.');
      onGoLogin();
    } catch (err: any) {
      alert(JSON.stringify(err.response?.data));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f4f8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', Arial, sans-serif",
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '48px 40px',
        width: 380,
        boxShadow: '0 4px 24px rgba(108,71,255,0.10)',
        border: '1px solid #c5d8f0',
      }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: '#0F4C81', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 24 }}>C</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111' }}>CORTEX</h2>
          <p style={{ margin: '6px 0 0', color: '#888', fontSize: 13 }}>Создайте аккаунт</p>
        </div>

        {/* USERNAME */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            ИМЯ ПОЛЬЗОВАТЕЛЯ
          </label>
          <input
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* EMAIL */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            EMAIL
          </label>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            ПАРОЛЬ
          </label>
          <input
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* BUTTON */}
        <button onClick={handleRegister} style={{
          width: '100%', padding: '13px',
          borderRadius: 10, border: 'none',
          background: '#0F4C81', color: 'white',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          marginBottom: 16,
        }}>
          Создать аккаунт →
        </button>

        {/* GO TO LOGIN */}
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: 0 }}>
          Уже есть аккаунт?{' '}
          <span
            onClick={onGoLogin}
            style={{ color: '#0F4C81', fontWeight: 600, cursor: 'pointer' }}
          >
            Войти
          </span>
        </p>

      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1.5px solid #c5d8f0',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  color: '#111',
  background: '#fafafa',
};
