import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Transfer from './pages/Transfer';
import History from './pages/History';
import { getMe, deposit, withdraw } from './api/api';
import Register from './pages/Register';

function App() {
  const [page, setPage] = useState<'login' | 'register' | 'dashboard' | 'transfer' | 'history'>('login');
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
const [loading, setLoading] = useState(false);



const handleDeposit = async () => {
  if (!amount) return;
  setLoading(true);
  try {
    await deposit(Number(amount));
    const res = await getMe();
    setUser(res.data);
    setAmount('');
    alert('✅ Депозит успешно!');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка');
  }
  setLoading(false);
};

const handleWithdraw = async () => {
  if (!amount) return;
  setLoading(true);
  try {
    await withdraw(Number(amount));
    const res = await getMe();
    setUser(res.data);
    setAmount('');
    alert('✅ Вывод успешно!');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка');
  }
  setLoading(false);
};


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((res) => { setUser(res.data); setPage('dashboard'); })
        .catch(() => { localStorage.removeItem('token'); setPage('login'); });
    }
  }, []);

  const handleLoginSuccess = () => {
    getMe().then((res) => { setUser(res.data); setPage('dashboard'); });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPage('login');
  };

  if (page === 'register') return <Register onGoLogin={() => setPage('login')} />;
  if (page === 'login') return <Login onSuccess={handleLoginSuccess} onGoRegister={() => setPage('register')} />;


  return (
    <div style={{ minHeight: '100vh', background: '#f0f2ff', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* TOP NAV */}
      <div style={{
        background: 'white',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>💳</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#6c47ff' }}>Cortex</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: '#6c47ff', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16
          }}>
            {(user?.username || user?.email || 'U')[0].toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, color: '#333' }}>{user?.username || user?.email}</span>
          <button onClick={handleLogout} style={{
            background: '#fff0f0', color: '#e53935',
            border: '1px solid #ffcdd2',
            padding: '8px 18px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: 600
          }}>Выйти</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>

        {/* BALANCE CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #6c47ff 0%, #a78bfa 100%)',
          borderRadius: 24, padding: '36px 40px',
          color: 'white', marginBottom: 28,
          boxShadow: '0 8px 32px rgba(108,71,255,0.25)'
        }}>
          <p style={{ margin: 0, opacity: 0.85, fontSize: 15 }}>Общий баланс</p>
          <h1 style={{ margin: '8px 0', fontSize: '52px', fontWeight: 800, letterSpacing: '-2px', color: 'lime' }}>
            ${Number(user?.wallet?.balance ?? 0).toFixed(2)}
          </h1>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 13 }}>
            Cortex Wallet • {user?.email}
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          {[
            { icon: '🏠', label: 'Главная', key: 'dashboard' },
            { icon: '💸', label: 'Перевод', key: 'transfer' },
            { icon: '📋', label: 'История', key: 'history' },

          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key as any)}
              style={{
                flex: 1, padding: '18px 0',
                borderRadius: 16, border: 'none',
                background: page === item.key ? '#6c47ff' : 'white',
                color: page === item.key ? 'white' : '#6c47ff',
                fontWeight: 700, fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
              {item.label}
            </button>
          ))}
        </div>

        {/* PAGE CONTENT */}
        <div style={{
          background: 'white', borderRadius: 20,
          padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}>
          {page === 'dashboard' && (
            <div>
              <h3 style={{ color: '#6c47ff', marginTop: 0 }}>👋 Добро пожаловать в Cortex!</h3>
              <p style={{ color: '#666' }}>Используйте меню выше для переводов и истории транзакций.</p>
              {/* DEPOSIT / WITHDRAW */}
                <div style={{
                  background: '#f8f5ff',
                  borderRadius: 16,
                  padding: '24px',
                  marginTop: 20,
                  border: '1px solid #ede9ff',
                }}>
                  <h4 style={{ margin: '0 0 16px', color: '#6c47ff', fontSize: 15 }}>
                    💰 Пополнить / Вывести
                  </h4>
                  <input
                    type="number"
                    placeholder="Введите сумму"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1.5px solid #e0d9ff',
                      fontSize: 15,
                      marginBottom: 12,
                      boxSizing: 'border-box' as const,
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleDeposit}
                      disabled={loading}
                      style={{
                        flex: 1, padding: '12px',
                        borderRadius: 10, border: 'none',
                        background: '#6c47ff', color: 'white',
                        fontWeight: 700, fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      ⬇ Депозит
                    </button>
                    <button
                      onClick={handleWithdraw}
                      disabled={loading}
                      style={{
                        flex: 1, padding: '12px',
                        borderRadius: 10, border: 'none',
                        background: 'white', color: '#6c47ff',
                        fontWeight: 700, fontSize: 14,
                        cursor: 'pointer',
                        outline: '2px solid #6c47ff',
                      }}
                    >
                      ⬆ Вывод
                    </button>
                  </div>
                </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
                <div style={{ flex: 1, background: '#f8f5ff', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 28 }}>💸</div>
                  <div style={{ fontWeight: 700, color: '#333', marginTop: 8 }}>Перевод</div>
                  <div style={{ color: '#888', fontSize: 13 }}>Отправить деньги</div>
                </div>
                <div style={{ flex: 1, background: '#f0fff4', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 28 }}>📈</div>
                  <div style={{ fontWeight: 700, color: '#333', marginTop: 8 }}>История</div>
                  <div style={{ color: '#888', fontSize: 13 }}>Все транзакции</div>
                </div>
                <div style={{ flex: 1, background: '#fff8f0', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 28 }}>🔒</div>
                  <div style={{ fontWeight: 700, color: '#333', marginTop: 8 }}>Защита</div>
                  <div style={{ color: '#888', fontSize: 13 }}>Анти-фрод система</div>
                </div>
              </div>
            </div>
          )}
          {page === 'transfer' && <Transfer />}
          {page === 'history' && <History />}
        </div>

      </div>
    </div>
  );
}

export default App;
