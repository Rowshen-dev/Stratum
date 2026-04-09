import { useEffect, useState } from 'react';
import { api } from '../api/api';

export default function History() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/transactions/history?page=1&limit=10');
        if (Array.isArray(res.data)) {
          setTransactions(res.data);
        } else if (Array.isArray(res.data.data)) {
          setTransactions(res.data.data);
        } else {
          setTransactions([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка');
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const getType = (t: any) => {
    if (!t.fromUser) return 'deposit';
    if (!t.toUser) return 'withdraw';
    return 'transfer';
  };

  const typeConfig: any = {
    deposit: { label: 'Депозит', icon: '⬇', color: '#1a7f3c', bg: '#f0fff4', border: '#b7ebc8', sign: '+' },
    withdraw: { label: 'Вывод', icon: '⬆', color: '#c0392b', bg: '#fff5f5', border: '#fcc', sign: '-' },
    transfer: { label: 'Перевод', icon: '↗', color: '#6c47ff', bg: '#f8f5ff', border: '#ede9ff', sign: '-' },
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
      Загрузка...
    </div>
  );

  return (
    <div>
      <h3 style={{ margin: '0 0 6px', color: '#111', fontSize: 18, fontWeight: 700 }}>
        📋 История транзакций
      </h3>
      <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>
        Все ваши операции
      </p>

      {error && (
        <div style={{
          background: '#fff5f5', border: '1px solid #fcc',
          borderRadius: 12, padding: '12px 16px',
          color: '#c0392b', fontSize: 14, marginBottom: 16,
        }}>
          ❌ {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 0',
          color: '#bbb', fontSize: 15,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          Транзакций пока нет
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {transactions.map((t, i) => {
            const type = getType(t);
            const cfg = typeConfig[type];
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #ebebeb',
                transition: 'box-shadow 0.15s',
              }}>
                {/* LEFT */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 42, height: 42,
                    borderRadius: 12,
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {cfg.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>
                      {cfg.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                      {type === 'transfer' && t.toUser &&
                        `→ Пользователь #${t.toUser.id}`}
                      {type === 'deposit' && 'Пополнение баланса'}
                      {type === 'withdraw' && 'Вывод средств'}
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontWeight: 700, fontSize: 16,
                    color: cfg.color,
                  }}>
                    {cfg.sign}${Number(t.amount).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: '#ccc', marginTop: 2 }}>
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString('ru-RU')
                      : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
