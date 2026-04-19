import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Admin from './pages/Admin';
import Toast from './components/Toast';
import { getMe, deposit, withdraw } from './api/api';
import Register from './pages/Register';


const ACCENT = '#0F4C81';
const ACCENT_LIGHT = '#e8f0fa';
const ACCENT_BORDER = '#c5d8f0';

function App() {
  const [page, setPage] = useState<'login' | 'register' | 'dashboard' | 'transfer' | 'history' | 'admin'>('login');
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
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

  const handleDeposit = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      await deposit(Number(amount));
      const res = await getMe();
      setUser(res.data);
      setAmount('');
      showToast('Депозит выполнен успешно!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ошибка', 'error');
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
      showToast('Вывод выполнен успешно!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ошибка', 'error');
    }
    setLoading(false);
  };

  if (page === 'login') return <Login onSuccess={handleLoginSuccess} onGoRegister={() => setPage('register')} />;
if (page === 'register') return <Register onGoLogin={handleLoginSuccess} />;


  const navItems = [
    { icon: '🏠', label: 'Главная', key: 'dashboard' },
    { icon: '💸', label: 'Перевод', key: 'transfer' },
    { icon: '📋', label: 'История', key: 'history' },
    ...(user?.role === 'admin' ? [{ icon: '👑', label: 'Админ', key: 'admin' }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* NAV */}
      <div style={{
        background: '#fff',
        borderBottom: `1px solid ${ACCENT_BORDER}`,
        padding: '0 40px',
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: ACCENT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 16 }}>C</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: ACCENT, letterSpacing: -0.5 }}>
            CORTEX
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: ACCENT, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13,
          }}>
            {(user?.username || user?.email || 'U')[0].toUpperCase()}
          </div>
          <span style={{ fontWeight: 600, color: '#333', fontSize: 13 }}>
            {user?.username || user?.email}
          </span>
          <button onClick={handleLogout} style={{
            background: 'white', color: '#666',
            border: `1px solid ${ACCENT_BORDER}`,
            padding: '7px 16px', borderRadius: 8,
            cursor: 'pointer', fontWeight: 600, fontSize: 12,
          }}>Выйти</button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 16px' }}>

        {/* BALANCE CARD */}
        <div style={{
          background: `linear-gradient(135deg, ${ACCENT} 0%, #1a6dbd 100%)`,
          borderRadius: 24, padding: '40px 44px',
          color: 'white', marginBottom: 24,
          boxShadow: '0 8px 32px rgba(15,76,129,0.25)',
        }}>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
            Общий баланс
          </p>
          <h1 style={{ margin: '10px 0 4px', fontSize: 52, fontWeight: 800, letterSpacing: -2, color: '#FFD700' }}>
            ${Number(user?.wallet?.balance ?? 0).toFixed(2)}
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
            Cortex Wallet • {user?.email}
          </p>
        </div>

        {/* NAV TABS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key as any)}
              style={{
                flex: 1, padding: '16px 0',
                borderRadius: 14,
                border: `2px solid ${page === item.key ? ACCENT : ACCENT_BORDER}`,
                background: page === item.key ? ACCENT : '#fff',
                color: page === item.key ? 'white' : ACCENT,
                fontWeight: 700, fontSize: 14,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
              {item.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{
          background: 'white', borderRadius: 20,
          padding: 32, border: `1px solid ${ACCENT_BORDER}`,
        }}>
          {page === 'dashboard' && (
            <div>
              <h3 style={{ color: ACCENT, marginTop: 0, fontSize: 18, fontWeight: 700 }}>
                Добро пожаловать 👋
              </h3>
              <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
                Управляйте своими финансами с Cortex
              </p>

              {/* DEPOSIT / WITHDRAW */}
              <div style={{
                background: ACCENT_LIGHT, borderRadius: 16,
                padding: 24, border: `1px solid ${ACCENT_BORDER}`,
                marginBottom: 24,
              }}>
                <h4 style={{ margin: '0 0 16px', color: ACCENT, fontSize: 15 }}>
                  💰 Пополнить / Вывести
                </h4>
                <input
                  type="number"
                  placeholder="Введите сумму"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    borderRadius: 10, border: `1.5px solid ${ACCENT_BORDER}`,
                    fontSize: 15, marginBottom: 12,
                    boxSizing: 'border-box' as const, outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleDeposit} disabled={loading} style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    border: 'none', background: ACCENT, color: 'white',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}>
                    ⬇ Депозит
                  </button>
                  <button onClick={handleWithdraw} disabled={loading} style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    border: `2px solid ${ACCENT}`, background: 'white',
                    color: ACCENT, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}>
                    ⬆ Вывод
                  </button>
                </div>
              </div>

              {/* CARDS */}
              <div style={{ display: 'flex', gap: 14 }}>
                {[
                  { icon: '💸', title: 'Перевод', desc: 'Отправить деньги' },
                  { icon: '📊', title: 'Аналитика', desc: 'Расходы и доходы' },
                  { icon: '🔒', title: 'Защита', desc: 'Анти-фрод система' },
                ].map((card) => (
                  <div key={card.title} style={{
                    flex: 1, background: ACCENT_LIGHT,
                    borderRadius: 14, padding: '22px 18px',
                    border: `1px solid ${ACCENT_BORDER}`,
                  }}>
                    <div style={{ fontSize: 26, marginBottom: 10 }}>{card.icon}</div>
                    <div style={{ fontWeight: 700, color: ACCENT, fontSize: 15 }}>{card.title}</div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{card.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {page === 'transfer' && <Transfer onToast={showToast} />}
          {page === 'history' && <History />}
          {page === 'admin' && <Admin onToast={showToast} />}
        </div>

      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export default App;
