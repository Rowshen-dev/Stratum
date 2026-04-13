import { useEffect, useState } from 'react';
import { api } from '../api/api';

interface AdminProps {
  onToast: (message: string, type: 'success' | 'error') => void;
}

export default function Admin({ onToast }: AdminProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceInputs, setBalanceInputs] = useState<{ [key: number]: string }>({});

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      onToast('Ошибка загрузки пользователей', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id: number) => {
    try {
      await api.post(`/users/block/${id}`);
      onToast('Пользователь заблокирован', 'success');
      fetchUsers();
    } catch {
      onToast('Ошибка блокировки', 'error');
    }
  };

  const handleUnblock = async (id: number) => {
    try {
      await api.post(`/users/unblock/${id}`);
      onToast('Пользователь разблокирован', 'success');
      fetchUsers();
    } catch {
      onToast('Ошибка разблокировки', 'error');
    }
  };

  const handleFreeze = async (id: number) => {
    try {
      await api.post(`/wallet/freeze/${id}`);
      onToast('Кошелёк заморожен', 'success');
      fetchUsers();
    } catch {
      onToast('Ошибка заморозки', 'error');
    }
  };

  const handleUnfreeze = async (id: number) => {
    try {
      await api.post(`/wallet/unfreeze/${id}`);
      onToast('Кошелёк разморожен', 'success');
      fetchUsers();
    } catch {
      onToast('Ошибка разморозки', 'error');
    }
  };

  const handleChangeBalance = async (id: number) => {
    const amount = balanceInputs[id];
    if (!amount) return;
    try {
      await api.post(`/wallet/admin/balance/${id}`, { amount: Number(amount) });
      onToast('Баланс изменён', 'success');
      setBalanceInputs((prev) => ({ ...prev, [id]: '' }));
      fetchUsers();
    } catch {
      onToast('Ошибка изменения баланса', 'error');
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
      Загрузка...
    </div>
  );

  return (
    <div>
      <h3 style={{ margin: '0 0 6px', color: '#111', fontSize: 18, fontWeight: 700 }}>
        👑 Админ панель
      </h3>
      <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>
        Управление пользователями
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {users.map((u) => (
          <div key={u.id} style={{
            background: '#fff',
            border: '1px solid #ebebeb',
            borderRadius: 16,
            padding: '20px 24px',
          }}>

            {/* USER INFO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#0F4C81', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16,
                }}>
                  {(u.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>
                    {u.email}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                    ID: {u.id} • Роль: {u.role}
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {u.isBlocked && (
                  <span style={{
                    background: '#fff5f5', color: '#c0392b',
                    border: '1px solid #fcc',
                    padding: '4px 10px', borderRadius: 20,
                    fontSize: 11, fontWeight: 600,
                  }}>🔒 Заблокирован</span>
                )}
                <span style={{
                  background: '#f8f5ff', color: '#0F4C81',
                  border: '1px solid #ede9ff',
                  padding: '4px 10px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700,
                }}>
                  ${Number(u.wallet?.balance ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
              {u.isBlocked ? (
                <button onClick={() => handleUnblock(u.id)} style={btnStyle('#1a7f3c')}>
                  ✅ Разблокировать
                </button>
              ) : (
                <button onClick={() => handleBlock(u.id)} style={btnStyle('#c0392b')}>
                  🔒 Заблокировать
                </button>
              )}

              <button onClick={() => handleFreeze(u.id)} style={btnStyle('#')}>
                ❄️ Заморозить
              </button>
              <button onClick={() => handleUnfreeze(u.id)} style={btnStyle('#0a85d1')}>
                🔥 Разморозить
              </button>
            </div>

            {/* CHANGE BALANCE */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input
                type="number"
                placeholder="Изменить баланс (+ или -)"
                value={balanceInputs[u.id] || ''}
                onChange={(e) => setBalanceInputs((prev) => ({ ...prev, [u.id]: e.target.value }))}
                style={{
                  flex: 1, padding: '10px 14px',
                  borderRadius: 10, border: '1.5px solid #ede9ff',
                  fontSize: 13, outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
              <button onClick={() => handleChangeBalance(u.id)} style={btnStyle('#0F4C81')}>
                💰 Применить
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

const btnStyle = (color: string): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  background: color,
  color: 'white',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
});
