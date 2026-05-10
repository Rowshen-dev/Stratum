import { useState } from 'react';
import { api, setToken } from '../api/api';

interface LoginProps {
  onSuccess: () => void;
  onGoRegister: () => void;
}

export default function Login({ onSuccess, onGoRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      const token = res.data.access_token;
      setToken(token);
      localStorage.setItem('token', token);

      onSuccess(); // ← вот это переключает на Dashboard
    } catch (err: any) {
      console.log(err.response?.data);
      alert(JSON.stringify(err.response?.data));
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '100px auto', fontFamily: 'Arial' }}>
      <h2 style={{ color: '#0F4C81' }}>💳 STRATUM — Вход</h2>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <br /><br />
      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <br /><br />
      <button onClick={handleLogin} style={btnStyle}>
        Войти
      </button>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#888', margin: '16px 0 0' }}>
        Нет аккаунта?{' '}
        <span
          onClick={onGoRegister}
          style={{ color: '#0F4C81', fontWeight: 600, cursor: 'pointer' }}
        >
          Зарегистрироваться
        </span>
      </p>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '16px',
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  background: '#0F4C81',
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  cursor: 'pointer',
};
