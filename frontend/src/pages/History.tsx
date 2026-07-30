import { useState, useEffect } from 'react';
import { api } from '../api/api';

export default function History() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/transactions/history?page=${page}&limit=${limit}`);
      setTransactions(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = transactions.filter(t => {
    const matchType = filter === 'all' || t.type?.toLowerCase() === filter;
    const matchSearch = !search || t.user?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const groupByDate = (txs: any[]) => {
    const groups: Record<string, any[]> = {};
    txs.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  const getIcon = (type: string) => {
    if (type === 'SEND') return { bg: '#f8fafc', icon: '⇄', color: '#888' };
    if (type === 'RECEIVE') return { bg: '#f0fdf4', icon: '↙', color: '#10b981' };
    return { bg: '#eff6ff', icon: '↙', color: '#2563eb' };
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 4px', letterSpacing: -0.5 }}>
        Transaction History
      </h2>
      <p style={{ fontSize: 14, color: '#888', margin: '0 0 20px' }}>
        View and filter your transactions
      </p>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: 15 }}>🔍</span>
        <input
          placeholder="Search by name or reference..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px 12px 40px',
            background: '#f8fafc', border: '1.5px solid #f1f5f9',
            borderRadius: 12, fontSize: 14, color: '#111',
            outline: 'none', boxSizing: 'border-box' as const,
          }}
        />
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'send', 'receive', 'deposit'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              background: filter === f ? '#111' : '#f8fafc',
              color: filter === f ? '#fff' : '#888',
              border: '1.5px solid ' + (filter === f ? '#111' : '#f1f5f9'),
              borderRadius: 20, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', textTransform: 'capitalize' as const,
            }}
          >
            {f === 'all' ? 'All types' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <p style={{ fontSize: 14 }}>No transactions yet</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, txs]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888', letterSpacing: 1, marginBottom: 8 }}>{date}</p>
            {txs.map((t, i) => {
              const style = getIcon(t.type);
              const isSend = t.type === 'SEND';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < txs.length - 1 ? '1px solid #f8fafc' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: style.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, color: style.color,
                      border: '1px solid #f1f5f9',
                    }}>
                      {style.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>
                        {t.type === 'SEND' ? `To ${t.user}` : t.type === 'RECEIVE' ? `From ${t.user}` : 'Deposit'}
                      </p>
                      <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                        {new Date(t.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: 15, fontWeight: 600, margin: '0 0 2px',
                      color: isSend ? '#111' : '#10b981',
                    }}>
                      {isSend ? '' : '+'}{isSend ? '-' : ''}${Number(t.amount).toFixed(2)}
                    </p>
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                      → €{(Number(t.amount) * 0.92).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: page === 1 ? '#ccc' : '#111', cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 500,
            }}
          >
            ← Previous
          </button>
          <span style={{ padding: '8px 16px', fontSize: 13, color: '#888' }}>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: page >= Math.ceil(total / limit) ? '#ccc' : '#111',
              cursor: page >= Math.ceil(total / limit) ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 500,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}