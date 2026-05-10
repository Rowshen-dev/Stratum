import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Admin from './pages/Admin';
import Toast from './components/Toast';
import { getMe, deposit, withdraw } from './api/api';
import Register from './pages/Register';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0d0d0f;
    font-family: 'Inter', sans-serif;
    color: #ffffff;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .stratum-app {
    min-height: 100vh;
    background: #0d0d0f;
    position: relative;
  }

  /* Gradient orbs background */
  .stratum-app::before {
    content: '';
    position: fixed;
    top: -300px; left: -200px;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .stratum-app::after {
    content: '';
    position: fixed;
    bottom: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  /* NAV */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13, 13, 15, 0.8);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 0 32px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-logo-icon {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    color: white;
  }

  .nav-logo-text {
    font-weight: 700;
    font-size: 17px;
    letter-spacing: 0.5px;
    color: white;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 13px;
    color: white;
  }

  .nav-username {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255,255,255,0.45);
  }

  .nav-logout {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.45);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 6px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.15s;
    font-family: 'Inter', sans-serif;
  }

  .nav-logout:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  /* MAIN */
  .main {
    max-width: 880px;
    margin: 0 auto;
    padding: 36px 20px 60px;
    position: relative;
    z-index: 1;
  }

  /* BALANCE CARD */
  .balance-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border-radius: 24px;
    padding: 48px 44px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 24px 64px rgba(0,0,0,0.4);
  }

  .balance-card::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%);
    pointer-events: none;
  }

  .balance-card::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 160px; height: 160px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .balance-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    font-weight: 500;
    margin-bottom: 10px;
  }

  .balance-amount {
    font-size: 56px;
    font-weight: 800;
    color: white;
    line-height: 1;
    margin-bottom: 10px;
    letter-spacing: -2px;
  }

  .balance-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .balance-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #6ee7b7;
    box-shadow: 0 0 8px rgba(110, 231, 183, 0.8);
    animation: pulse 2s infinite;
    display: inline-block;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* QUICK ACTIONS */
  .quick-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }

  .quick-action {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-action:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-2px);
  }

  .quick-action-icon {
    font-size: 22px;
    margin-bottom: 8px;
  }

  .quick-action-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.3px;
  }

  /* NAV TABS */
  .nav-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 4px;
  }

  .nav-tab {
    flex: 1;
    padding: 12px 0;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.35);
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .nav-tab:hover {
    color: rgba(255,255,255,0.6);
  }

  .nav-tab.active {
    background: rgba(255,255,255,0.08);
    color: white;
    font-weight: 600;
  }

  .nav-tab-icon { font-size: 16px; }

  /* CONTENT */
  .content-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    padding: 32px;
  }

  /* DEPOSIT SECTION */
  .deposit-section {
    background: rgba(99, 102, 241, 0.06);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .amount-input {
    width: 100%;
    padding: 14px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    font-size: 15px;
    color: white;
    outline: none;
    margin-bottom: 12px;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }

  .amount-input:focus {
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(99, 102, 241, 0.06);
  }

  .amount-input::placeholder { color: rgba(255,255,255,0.2); }

  .btn-row { display: flex; gap: 10px; }

  .btn-primary {
    flex: 1; padding: 13px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white; font-weight: 600; font-size: 14px;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }

  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-secondary {
    flex: 1; padding: 13px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.7);
    font-weight: 600; font-size: 14px;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }

  .btn-secondary:hover {
    background: rgba(255,255,255,0.09);
    color: white;
  }

  .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

  /* FEATURE GRID */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .feature-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 22px 18px;
    transition: all 0.2s;
    cursor: default;
  }

  .feature-card:hover {
    background: rgba(99, 102, 241, 0.07);
    border-color: rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);
  }

  .feature-icon { font-size: 24px; margin-bottom: 10px; }

  .feature-title {
    font-weight: 600; font-size: 14px;
    color: rgba(255,255,255,0.8); margin-bottom: 4px;
  }

  .feature-desc { font-size: 12px; color: rgba(255,255,255,0.3); }

  /* WELCOME */
  .welcome-title {
    font-size: 20px; font-weight: 700;
    color: white; margin-bottom: 6px;
  }

  .welcome-sub {
    font-size: 14px; color: rgba(255,255,255,0.35);
    margin-bottom: 28px;
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
        .then((res: any) => { setUser(res.data); setPage('dashboard'); })
        .catch(() => { localStorage.removeItem('token'); setPage('login'); });
    }
  }, []);

  const handleLoginSuccess = () => {
    getMe().then((res: any) => { setUser(res.data); setPage('dashboard'); });
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
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">S</div>
          <span className="nav-logo-text">Stratum</span>
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

        <div className="content-card">
          {page === 'dashboard' && (
            <div>
              <div className="welcome-title">Добро пожаловать 👋</div>
              <div className="welcome-sub">Управляйте своими финансами с Stratum</div>

              <div className="deposit-section">
                <div className="section-title">💰 Пополнить / Вывести</div>
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
          {page === 'transfer' && <Transfer onToast={showToast} onSuccess={() => getMe().then((res: any) => setUser(res.data))} />}
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