import { useEffect, useState } from 'react';
import { api } from '../api/api';

export default function History() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/transactions/history?page=1&limit=10');

        // 👇 ВАЖНО: проверяем массив
       if (Array.isArray(res.data)) {
          setTransactions(res.data);
        } else if (Array.isArray(res.data.data)) {
          setTransactions(res.data.data);
        } else {
          setTransactions([]);
        }

      } catch (err: any) {
        setError(err.response?.data?.message || 'Error');
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>History</h2>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {transactions.length === 0 ? (
        <p>No transactions</p>
      ) : (
        transactions.map((t, i) => (
          <div key={i}>
            <p>From: {t.fromUser?.id}</p>
            <p>To: {t.toUser?.id}</p>
            <p>Amount: {t.amount}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}