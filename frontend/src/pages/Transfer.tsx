import { useState } from 'react';
import { api } from '../api/api';

export default function Transfer() {
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!toUserId || !amount) return;
    setLoading(true);
    setSuccess(false);
    try {
      await api.post('/transactions/transfer', {
        toUserId: Number(toUserId),
        amount: Number(amount),
      });
      setSuccess(true);
      setToUserId('');
      setAmount('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка перевода');
    }
    setLoading(false);
  };

  return (
    <div>
      <h3 style={{ margin: '0 0 6px', color: '#111', fontSize: 18, fontWeight: 700 }}>
        💸 Перевод
      </h3>
      <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>
        Отправьте деньги другому пользователю
      </p>

      {/* SUCCESS */}
      {success && (
        <div style={{
          background: '#f0fff4',
          border: '1px solid #b7ebc8',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 20,
          color: '#1a7f3c',
          fontWeight: 600,
          fontSize: 14,
        }}>
          ✅ Перевод выполнен успешно!
        </div>
      )}

      {/* USER ID */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          fontSize: 12, color: '#888',
          fontWeight: 600, display: 'block', marginBottom: 6,
          letterSpacing: 0.5,
        }}>
          ID ПОЛУЧАТЕЛЯ
        </label>
        <input
          placeholder="Например: 2"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          type="number"
          style={inputStyle}
        />
      </div>

      {/* AMOUNT */}
      <div style={{ marginBottom: 24 }}>
        <label style={{
          fontSize: 12, color: '#888',
          fontWeight: 600, display: 'block', marginBottom: 6,
          letterSpacing: 0.5,
        }}>
          СУММА ($)
        </label>
        <input
          placeholder="Например: 100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          style={inputStyle}
        />
      </div>

      {/* BUTTON */}
      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: loading ? '#a78bfa' : '#6c47ff',
          color: 'white',
          fontSize: 15,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {loading ? 'Отправка...' : '💸 Отправить'}
      </button>

      {/* INFO */}
      <div style={{
        marginTop: 20,
        padding: '14px 16px',
        background: '#f8f5ff',
        borderRadius: 12,
        border: '1px solid #ede9ff',
      }}>
        <p style={{ margin: 0, fontSize: 12, color: '#888', lineHeight: 1.6 }}>
          ℹ️ Комиссия за перевод: <strong style={{ color: '#6c47ff' }}>1%</strong><br />
          Минимальная сумма: <strong style={{ color: '#6c47ff' }}>$1</strong><br />
          Максимальная сумма: <strong style={{ color: '#6c47ff' }}>$100,000</strong>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 10,
  border: '1.5px solid #ede9ff',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
  color: '#111',
  background: '#fafafa',
  transition: 'border 0.2s',
};
