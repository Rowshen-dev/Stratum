import { useState } from 'react';
import { api } from '../api/api';

export default function Transfer() {
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = async () => {
    try {
      await api.post('/transactions/transfer', {
        toUserId: Number(toUserId),
        amount: Number(amount),
      });

      alert('Transfer success');
    } catch (err: any) {
      alert('Error: ' + err.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Send Money</h2>

      <input
        placeholder="User ID"
        value={toUserId}
        onChange={(e) => setToUserId(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br /><br />

      <button onClick={handleSend}>Send</button>
    </div>
  );
}