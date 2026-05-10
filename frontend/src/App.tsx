import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Admin from './pages/Admin';
import Toast from './components/Toast';
import { getMe, deposit, withdraw } from './api/api';
import Register from './pages/Register';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0a;
    font-family: 'Outfit', sans-serif;
    color: #e8e0d0;
    min-height: 100vh;
  }

  .stratum-app {
    min-height: 100vh;
    background: #0a0a0a;
    position: relative;
    overflow-x: hidden;
  }

  .stratum-app::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: 
      radial-gradient(ellipse at 20% 20%, rgba(212, 175, 55, 0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  /* NAV */
  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 10, 10, 0.92);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    padding: 0 48px;
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .nav-logo-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: linear-gradient(135deg, #d4af37, #f5d76e, #b8960c);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 18px;
    color: #0a0a0a;
    box-shadow: 0 0 24px rgba(212, 175, 55, 0.35);
  }

  .nav-logo-text {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 22px;
    letter-spacing: 4px;
    background: linear-gradient(90deg, #d4af37, #f5d76e, #d4af37);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .nav-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d4af37, #b8960c);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    color: #0a0a0a;
    box-shadow: 0 0 16px rgba(212, 175, 55, 0.3);
  }

  .nav-username {
    font-size: 13px;
    font-weight: 400;
    color: rgba(232, 224, 208, 0.5);
    letter-spacing: 0.5px;
  }

  .nav-logout {
    background: transparent;
    color: rgba(212, 175, 55, 0.6);
    border: 1px solid rgba(212, 175, 55, 0.2);
    padding: 7px 18px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .nav-logout:hover {
    background: rgba(212, 175, 55, 0.08);
    color: #d4af37;
    border-color: rgba(212, 175, 55, 0.4);
  }

  /* MAIN */
  .main {
    max-width: 920px;
    margin: 0 auto;
    padding: 48px 24px;
    position: relative;
    z-index: 1;
  }

  /* BALANCE CARD */
  .balance-card {
    background: linear-gradient(135deg, #111108 0%, #1a1a0f 40%, #111108 100%);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 24px;
    padding: 52px 56px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
    box-shadow: 
      0 24px 80px rgba(0, 0, 0, 0.7),
      inset 0 1px 0 rgba(212, 175, 55, 0.1),
      0 0 0 1px rgba(212, 175, 55, 0.05);
  }

  .balance-card::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .balance-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
  }

  .balance-label {
    font-size: 10px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: rgba(212, 175, 55, 0.5);
    font-weight: 500;
    margin-bottom: 16px;
  }

  .balance-amount {
    font-family: 'Playfair Display', serif;
    font-size: 64px;
    font-weight: 700;
    letter-spacing: -1px;
    background: linear-gradient(135deg, #f5d76e, #d4af37, #b8960c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
    margin-bottom: 12px;
  }

  .balance-sub {
    font-size: 12px;
    color: rgba(232, 224, 208, 0.25);
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .balance-dot {
    display: inline-block;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #d4af37;
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.8);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(212, 175, 55, 0.8); }
    50% { opacity: 0.5; box-shadow: 0 0 4px rgba(212, 175, 55, 0.3); }
  }

  /* NAV TABS */
  .nav-tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 28px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(212, 175, 55, 0.08);
    border-radius: 14px;
    padding: 5px;
  }

  .nav-tab {
    flex: 1;
    padding: 14px 0;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: rgba(232, 224, 208, 0.3);
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s;
    font-family: 'Outfit', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    letter-spacing: 0.5px;
  }

  .nav-tab:hover {
    color: rgba(212, 175, 55, 0.6);
    background: rgba(212, 175, 55, 0.04);
  }

  .nav-tab.active {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.08));
    color: #d4af37;
    border: 1px solid rgba(212, 175, 55, 0.2);
    box-shadow: 0 2px 12px rgba(212, 175, 55, 0.1);
  }

  .nav-tab-icon { font-size: 17px; }

  /* CONTENT CARD */
  .content-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(212, 175, 55, 0.08);
    border-radius: 20px;
    padding: 40px;
  }

  /* DEPOSIT SECTION */
  .deposit-section {
    background: rgba(212, 175, 55, 0.04);
    border: 1px solid rgba(212, 175, 55, 0.12);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: rgba(232, 224, 208, 0.7);
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .amount-input {
    width: 100%;
    padding: 16px 20px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(212, 175, 55, 0.15);
    border-radius: 10px;
    font-size: 16px;
    color: #e8e0d0;
    outline: none;
    margin-bottom: 16px;
    font-family: 'Outfit', sans-serif;
    transition: all 0.2s;
    letter-spacing: 0.5px;
  }

  .amount-input:focus {
    border-color: rgba(212, 175, 55, 0.4);
    background: rgba(212, 175, 55, 0.04);
  }

  .amount-input::placeholder { color: rgba(232, 224, 208, 0.2); }

  .btn-row { display: flex; gap: 12px; }

  .btn-primary {
    flex: 1;
    padding: 14px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #d4af37, #b8960c);
    color: #0a0a0a;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(212, 175, 55, 0.35);
  }

  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-secondary {
    flex: 1;
    padding: 14px;
    border-radius: 10px;
    border: 1px solid rgba(212, 175, 55, 0.2);
    background: transparent;
    color: rgba(212, 175, 55, 0.8);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
    letter-spacing: 0.5px;
  }

  .btn-secondary:hover {
    background: rgba(212, 175, 55, 0.06);
    border-color: rgba(212, 175, 55, 0.35);
    color: #d4af37;
  }

  .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

  /* FEATURE GRID */
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .feature-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(212, 175, 55, 0.07);
    border-radius: 14px;
    padding: 26px 22px;
    transition: all 0.25s;
  }

  .feature-card:hover {
    background: rgba(212, 175, 55, 0.04);
    border-color: rgba(212, 175, 55, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }

  .feature-icon { font-size: 26px; margin-bottom: 14px; }

  .feature-title {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    font-size: 15px;
    color: rgba(232, 224, 208, 0.8);
    margin-bottom: 6px;
  }

  .feature-desc { font-size: 12px; color: rgba(232, 224, 208, 0.3); letter-spacing: 0.3px; }

  /* WELCOME */
  .welcome-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: #e8e0d0;
    margin-bottom: 8px;
  }

  .welcome-sub {
    font-size: 14px;
    color: rgba(232, 224, 208, 0.3);
    margin-bottom: 36px;
    letter-spacing: 0.3px;
  }

  /* DIVIDER */
  .gold-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
    margin: 32px 0;
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