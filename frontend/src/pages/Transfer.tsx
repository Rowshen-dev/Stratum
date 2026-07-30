import { useState } from 'react';
import { api } from '../api/api';

interface TransferProps {
  onToast: (message: string, type: 'success' | 'error') => void;
  onSuccess: () => void;
}

export default function Transfer({ onToast, onSuccess }: TransferProps) {
  const [step, setStep] = useState(1);
  const [toEmail, setToEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const exchangeRate = 0.92;
  const fee = Number(amount) > 0 ? Number(amount) * 0.001 : 0;
  const received = Number(amount) > 0 ? (Number(amount) * exchangeRate).toFixed(2) : '0.00';

  const handleNext = () => {
    if (!toEmail || !amount) {
      onToast('Please fill in all fields', 'error');
      return;
    }
    setStep(2);
  };

  const handleSend = async () => {
    setLoading(true);
    try {
      await api.post('/transactions/transfer', {
        toEmail,
        amount: Number(amount),
      });
      setSuccess(true);
      setStep(3);
      onSuccess();
    } catch (err: any) {
      onToast(err.response?.data?.message || 'Transfer failed', 'error');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setStep(1);
    setToEmail('');
    setAmount('');
    setRecipientName('');
    setRecipientCountry('');
    setNote('');
    setSuccess(false);
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 4px', letterSpacing: -0.5 }}>
        Send Money
      </h2>
      <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px' }}>
        Instant international transfers
      </p>

      {/* Progress Steps */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: 3, borderRadius: 4,
            background: s <= step ? '#2563eb' : '#e2e8f0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* STEP 1: Amount & Email */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 8 }}>
              You send
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                style={{
                  flex: 1, padding: '14px 16px',
                  background: '#f8fafc', border: '1.5px solid #f1f5f9',
                  borderRadius: 12, fontSize: 18, fontWeight: 600,
                  color: '#111', outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
              <div style={{
                padding: '14px 16px',
                background: '#f8fafc', border: '1.5px solid #f1f5f9',
                borderRadius: 12, fontSize: 14, fontWeight: 500,
                color: '#111', display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap' as const,
              }}>
                🇺🇸 USD
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#f8fafc', border: '1.5px solid #e2e8f0',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#888',
            }}>↓</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 8 }}>
              Recipient gets
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{
                flex: 1, padding: '14px 16px',
                background: '#f8fafc', border: '1.5px solid #f1f5f9',
                borderRadius: 12, fontSize: 18, fontWeight: 600,
                color: '#888',
              }}>
                {received}
              </div>
              <div style={{
                padding: '14px 16px',
                background: '#f8fafc', border: '1.5px solid #f1f5f9',
                borderRadius: 12, fontSize: 14, fontWeight: 500,
                color: '#111', display: 'flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap' as const,
              }}>
                🇪🇺 EUR
              </div>
            </div>
          </div>

          {/* Rate info */}
          {Number(amount) > 0 && (
            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: '14px 16px',
              marginBottom: 20, border: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#888' }}>Exchange rate</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>1 USD = {exchangeRate} EUR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#888' }}>Fee</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{fee.toFixed(2)} USD</span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 8 }}>
              Recipient email
            </label>
            <input
              type="email"
              placeholder="recipient@email.com"
              value={toEmail}
              onChange={e => setToEmail(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px',
                background: '#f8fafc', border: '1.5px solid #f1f5f9',
                borderRadius: 12, fontSize: 15, color: '#111',
                outline: 'none', boxSizing: 'border-box' as const,
              }}
            />
          </div>

          <button
            onClick={handleNext}
            style={{
              width: '100%', padding: '14px',
              background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2: Confirm */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 8 }}>
              Recipient name
            </label>
            <input
              type="text"
              placeholder="Full name"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px',
                background: '#f8fafc', border: '1.5px solid #f1f5f9',
                borderRadius: 12, fontSize: 15, color: '#111',
                outline: 'none', boxSizing: 'border-box' as const,
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 8 }}>
              Recipient country
            </label>
            <input
              type="text"
              placeholder="e.g. Germany"
              value={recipientCountry}
              onChange={e => setRecipientCountry(e.target.value)}
              style={{
                width: '100%', padding: '13px 16px',
                background: '#f8fafc', border: '1.5px solid #f1f5f9',
                borderRadius: 12, fontSize: 15, color: '#111',
                outline: 'none', boxSizing: 'border-box' as const,
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 8 }}>
              Note (optional)
            </label>
            <textarea
              placeholder="Payment purpose"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '13px 16px',
                background: '#f8fafc', border: '1.5px solid #f1f5f9',
                borderRadius: 12, fontSize: 15, color: '#111',
                outline: 'none', boxSizing: 'border-box' as const,
                resize: 'none' as const, fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Transfer summary */}
          <div style={{
            background: '#f8fafc', borderRadius: 12,
            padding: '16px', marginBottom: 24,
            border: '1px solid #f1f5f9',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12 }}>Transfer details</div>
            {[
              { label: 'Amount', value: `${amount} USD` },
              { label: 'Recipient gets', value: `${received} EUR` },
              { label: 'Fee', value: `${fee.toFixed(2)} USD` },
              { label: 'Total', value: `${(Number(amount) + fee).toFixed(2)} USD` },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                marginBottom: i < 3 ? 8 : 0,
                paddingTop: i === 3 ? 8 : 0,
                borderTop: i === 3 ? '1px solid #e2e8f0' : 'none',
              }}>
                <span style={{ fontSize: 13, color: '#888' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: i === 3 ? 700 : 500, color: '#111' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setStep(1)}
              style={{
                padding: '14px 24px',
                background: '#fff', color: '#111',
                border: '1.5px solid #e2e8f0', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Back
            </button>
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                flex: 1, padding: '14px',
                background: loading ? '#93c5fd' : '#2563eb', color: '#fff',
                border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Sending...' : 'Confirm & Send'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Success */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 28,
          }}>✓</div>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>
            Transfer initiated
          </h3>
          <p style={{ fontSize: 14, color: '#888', margin: '0 0 32px' }}>
            {amount} USD → {received} EUR · {recipientName || toEmail}
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleReset}
              style={{
                flex: 1, padding: '14px',
                background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              New transfer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}