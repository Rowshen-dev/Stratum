import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Admin from './pages/Admin';
import Toast from './components/Toast';
import { getMe, deposit, withdraw } from './api/api';
import Register from './pages/Register';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #020818;
    font-family: 'DM Sans', sans-serif;
    color: #e8edf5;
    min-height: 100vh;
  }

  .stratum-app {
    min-height: 100vh;
    background: #020818;
    position: relative;
    overflow-x: hidden;
  }

  .stratum-app::before {
    content: '';
    position: fixed;
    top: -200px;
    left: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(14, 90, 200, 0.15) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .stratum-app::after {
    content: '';
    position: fixed;
    bottom: -200px;
    right: -200px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(0, 180, 255, 0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* NAV */
  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(2, 8, 24, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0 40px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-logo-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #0e5ac8, #00b4ff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: white;
    box-shadow: 0 0 20px rgba(0, 180, 255, 0.3);
  }

  .nav-logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 20px;
    letter-spacing: 2px;
    background: linear-gradient(90deg, #fff, #00b4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0e5ac8, #00b4ff);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    color: white;
    box-shadow: 0 0 12px rgba(0, 180, 255, 0.25);
  }

  .nav-username {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
  }

  .nav-logout {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 7px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .nav-logout:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  /* MAIN CONTENT */
  .main {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
    position: relative;
    z-index: 1;
  }

  /* BALANCE CARD */
  .balance-card {
    background: linear-gradient(135deg, #0a1628 0%, #0d2040 50%, #0a1628 100%);
    border: 1px solid rgba(14, 90, 200, 0.3);
    border-radius: 28px;
    padding: 44px 48px;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  .balance-card::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 180, 255, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .balance-card::after {
    content: '';
    position: absolute;
    bottom: -50px;
    left: -50px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(14, 90, 200, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .balance-label {
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    font-weight: 500;
    margin-bottom: 12px;
  }

  .balance-amount {
    font-family: 'Syne', sans-serif;
    font-size: 58px;
    font-weight: 800;
    letter-spacing: -2px;
    background: linear-gradient(90deg, #ffffff, #00b4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    margin-bottom: 8px;
  }

  .balance-sub {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.5px;
  }

  .balance-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00b4ff;
    margin-right: 6px;
    box-shadow: 0 0 8px rgba(0, 180, 255, 0.8);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* NAV TABS */
  .nav-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 18px;
    padding: 6px;
  }

  .nav-tab {
    flex: 1;
    padding: 14px 0;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.4);
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .nav-tab:hover {
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.04);
  }

  .nav-tab.active {
    background: linear-gradient(135deg, #0e5ac8, #0080e0);
    color: white;
    box-shadow: 0 4px 20px rgba(14, 90, 200, 0.4);
  }

  .nav-tab-icon {
    font-size: 18px;
  }

  /* CONTENT CARD */
  .content-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 36px;
    backdrop-filter: blur(10px);
  }

  /* DEPOSIT/WITHDRAW SECTION */
  .deposit-section {
    background: rgba(14, 90, 200, 0.08);
    border: 1px solid rgba(14, 90, 200, 0.2);
    border-radius: 18px;
    padding: 28px;
    margin-bottom: 28px;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgba(255,255,255,0.8);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .amount-input {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    font-size: 16px;
    color: white;
    outline: none;
    margin-bottom: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: border 0.2s;
  }

  .amount-input:focus {
    border-color: rgba(0, 180, 255, 0.5);
    background: rgba(0, 180, 255, 0.05);
  }

  .amount-input::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .btn-row {
    display: flex;
    gap: 12px;
  }

  .btn-primary {
    flex: 1;
    padding: 13px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #0e5ac8, #0080e0);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 16px rgba(14, 90, 200, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(14, 90, 200, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    flex: 1;
    padding: 13px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.8);
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .btn-secondary:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.2);
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* FEATURE CARDS */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .feature-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 24px 20px;
    transition: all 0.2s;
    cursor: default;
  }

  .feature-card:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(0, 180, 255, 0.2);
    transform: translateY(-2px);
  }

  .feature-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }

  .feature-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 14px;
    color: rgba(255,255,255,0.85);
    margin-bottom: 4px;
  }

  .feature-desc {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
  }

  /* WELCOME */
  .welcome-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: white;
    margin-bottom: 6px;
  }

  .welcome-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 32px;
  }
`;

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
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

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
    { icon: '⌂', label: 'Главная', key: 'dashboard' },
    { icon: '↗', label: 'Перевод', key: 'transfer' },
    { icon: '≡', label: 'История', key: 'history' },
    ...(user?.role === 'admin' ? [{ icon: '◈', label: 'Админ', key: 'admin' }] : []),
  ];

  return (
    <div className="stratum-app">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">S</div>
          <span className="nav-logo-text">STRATUM</span>
        </div>
        <div className="nav-right">
          <div className="nav-avatar">
            {(user?.username || user?.email || 'U')[0].toUpperCase()}
          </div>
          <span className="nav-username">{user?.username || user?.email}</span>
          <button className="nav-logout" onClick={handleLogout}>Выйти</button>
        </div>
      </nav>

      <div className="main">
        {/* BALANCE */}
        <div className="balance-card">
          <div className="balance-label">Общий баланс</div>
          <div className="balance-amount">
            ${Number(user?.wallet?.balance ?? 0).toFixed(2)}
          </div>
          <div className="balance-sub">
            <span className="balance-dot"></span>
            Stratum Wallet • {user?.email}
          </div>
        </div>

        {/* TABS */}
        <div className="nav-tabs">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-tab ${page === item.key ? 'active' : ''}`}
              onClick={() => setPage(item.key as any)}
            >
              <span className="nav-tab-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="content-card">
          {page === 'dashboard' && (
            <div>
              <div className="welcome-title">Добро пожаловать 👋</div>
              <div className="welcome-sub">Управляйте своими финансами с Stratum</div>

              <div className="deposit-section">
                <div className="section-title">
                  <span>💰</span> Пополнить / Вывести
                </div>
                <input
                  type="number"
                  placeholder="Введите сумму"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                />
                <div className="btn-row">
                  <button onClick={handleDeposit} disabled={loading} className="btn-primary">
                    ⬇ Депозит
                  </button>
                  <button onClick={handleWithdraw} disabled={loading} className="btn-secondary">
                    ⬆ Вывод
                  </button>
                </div>
              </div>

              <div className="feature-grid">
                {[
                  { icon: '↗', title: 'Перевод', desc: 'Отправить деньги' },
                  { icon: '📊', title: 'Аналитика', desc: 'Расходы и доходы' },
                  { icon: '🔒', title: 'Защита', desc: 'Анти-фрод система' },
                ].map((card) => (
                  <div key={card.title} className="feature-card">
                    <div className="feature-icon">{card.icon}</div>
                    <div className="feature-title">{card.title}</div>
                    <div className="feature-desc">{card.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {page === 'transfer' && <Transfer onToast={showToast} onSuccess={() => getMe().then(res => setUser(res.data))} />}
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