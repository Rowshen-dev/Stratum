import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Admin from './pages/Admin';
import Toast from './components/Toast';
import { getMe, deposit, withdraw } from './api/api';
import Register from './pages/Register';

function App() {
  const [page, setPage] = useState<'login' | 'register' | 'dashboard' | 'transfer' | 'history' | 'admin'>('login');
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

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
      showToast('Deposit successful!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error', 'error');
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
      showToast('Withdrawal successful!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
    setLoading(false);
  };

  if (page === 'login') return <Login onSuccess={handleLoginSuccess} onGoRegister={() => setPage('register')} />;
  if (page === 'register') return <Register onGoLogin={handleLoginSuccess} />;

  const getHour = () => new Date().getHours();
  const getGreeting = () => {
    const h = getHour();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navItems = [
    { icon: '⊞', label: 'Dashboard', key: 'dashboard' },
    { icon: '⇄', label: 'Transfer', key: 'transfer' },
    { icon: '◷', label: 'History', key: 'history' },
    ...(user?.role === 'admin' ? [{ icon: '◈', label: 'Admin', key: 'admin' }] : []),
  ];

  const balance = Number(user?.wallet?.balance ?? 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* TOP NAV */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #f1f5f9',
        padding: '0 20px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: '#111',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>S</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: -0.3 }}>Stratum</span>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
        >
          <div style={{ width: 20, height: 2, background: '#111', marginBottom: 4 }} />
          <div style={{ width: 20, height: 2, background: '#111', marginBottom: 4 }} />
          <div style={{ width: 20, height: 2, background: '#111' }} />
        </button>
      </nav>

      {/* SLIDE-IN MENU */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
        }}>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
          />
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 260,
            background: '#fff',
            padding: '24px 20px',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>S</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>Stratum</span>
              </div>
              <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setPage(item.key as any); setMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: page === item.key ? '#f1f5f9' : 'transparent',
                  color: page === item.key ? '#111' : '#666',
                  fontWeight: page === item.key ? 600 : 400,
                  fontSize: 15,
                  cursor: 'pointer',
                  marginBottom: 4,
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div style={{ marginTop: 'auto' }}>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{user?.email}</div>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none', border: 'none',
                    color: '#ef4444', fontSize: 14, fontWeight: 500,
                    cursor: 'pointer', padding: 0,
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>

        {page === 'dashboard' && (
          <>
            {/* Greeting */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 4px', letterSpacing: -0.5 }}>
                {getGreeting()}, {user?.username || user?.email?.split('@')[0]}
              </h2>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Here's your financial overview</p>
            </div>

            {/* Balance Card */}
            <div style={{
              background: '#0f172a',
              borderRadius: 20,
              padding: '28px 24px',
              marginBottom: 20,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -40, right: -40,
                width: 180, height: 180,
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '50%',
              }} />
              <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>
                TOTAL BALANCE
              </p>
              <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: -1 }}>
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>● USD: ${balance.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { icon: '⇄', title: 'Transfer', desc: 'Send money abroad', key: 'transfer' },
                { icon: '↙', title: 'Deposit', desc: 'Add funds', action: 'deposit' },
                { icon: '↗', title: 'Withdraw', desc: 'Cash out', action: 'withdraw' },
                { icon: '+', title: 'New Wallet', desc: 'Add currency', action: 'wallet' },
              ].map((item) => (
                <div
                  key={item.title}
                  onClick={() => item.key && setPage(item.key as any)}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '20px 16px',
                    cursor: 'pointer',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 40, height: 40,
                    background: '#f8fafc',
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, marginBottom: 12,
                    color: '#111',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Deposit / Withdraw */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '20px',
              border: '1px solid #f1f5f9',
              marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 16px' }}>
                Add / Withdraw Funds
              </h3>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1.5px solid #f1f5f9',
                  borderRadius: 10,
                  fontSize: 15,
                  color: '#111',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: 12,
                }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleDeposit}
                  disabled={loading}
                  style={{
                    flex: 1, padding: '12px',
                    background: '#2563eb', color: '#fff',
                    border: 'none', borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  ↙ Deposit
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  style={{
                    flex: 1, padding: '12px',
                    background: '#fff', color: '#111',
                    border: '1.5px solid #e2e8f0', borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  ↗ Withdraw
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: '#0f172a', borderRadius: 16, padding: '20px' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase' }}>MONTHLY INCOME</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>$0</p>
              </div>
              <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '20px' }}>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase' }}>MONTHLY EXPENSES</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0 }}>$0</p>
              </div>
            </div>
          </>
        )}

        {page === 'transfer' && <Transfer onToast={showToast} onSuccess={() => getMe().then((res: any) => setUser(res.data))} />}
        {page === 'history' && <History />}
        {page === 'admin' && <Admin onToast={showToast} />}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;