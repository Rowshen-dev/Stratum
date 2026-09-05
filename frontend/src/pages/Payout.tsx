import { useState, useEffect, useCallback } from 'react';
import {
  getQuote,
  getBeneficiaries,
  createBeneficiary,
  createPayout,
  getPayout,
  type DeliveryMethod,
} from '../api/api';

interface PayoutProps {
  onToast: (message: string, type: 'success' | 'error') => void;
  onSuccess: () => void;
}

interface Quote {
  sourceCurrency: string;
  sourceAmount: number;
  targetCurrency: string;
  targetAmount: number;
  midRate: number;
  quotedRate: number;
  markupPercent: number;
  fixedFee: number;
  totalDebit: number;
  rail: string;
  hoursToDeliver: number;
  countryName: string;
  rateIsStale: boolean;
}

interface Beneficiary {
  id: number;
  name: string;
  country: string;
  currency: string;
  deliveryMethod: DeliveryMethod;
  cardLast4: string | null;
  bankName: string | null;
}

interface StatusEvent {
  status: string;
  at: string;
  note: string;
}

interface PayoutRecord {
  reference: string;
  status: string;
  statusHistory: StatusEvent[];
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  estimatedDelivery: string | null;
  beneficiary: Beneficiary;
}

const COUNTRIES = [
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿', currency: 'UZS' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿', currency: 'KZT' },
];

const SOURCE_CURRENCIES = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'EUR', flag: '🇪🇺' },
  { code: 'GBP', flag: '🇬🇧' },
];

const PURPOSES = [
  { value: 'CONTRACTOR_PAYMENT', label: 'Contractor payment' },
  { value: 'SUPPLIER_INVOICE', label: 'Supplier invoice' },
  { value: 'SERVICES', label: 'Professional services' },
  { value: 'SALARY', label: 'Salary' },
];

const STATUS_LABELS: Record<string, string> = {
  INITIATED: 'Payment created',
  COMPLIANCE_CHECK: 'Compliance check',
  PROCESSING: 'Converting funds',
  SENT_TO_PARTNER: 'Sent to partner',
  COMPLETED: 'Credited',
  FAILED: 'Failed',
};

const ALL_STATUSES = [
  'INITIATED',
  'COMPLIANCE_CHECK',
  'PROCESSING',
  'SENT_TO_PARTNER',
  'COMPLETED',
];

// --- Общие стили, чтобы не дублировать инлайн ---

const input: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  background: '#f8fafc',
  border: '1.5px solid #f1f5f9',
  borderRadius: 12,
  fontSize: 15,
  color: '#111',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#111',
  marginBottom: 8,
};

const primaryButton = (disabled: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '14px',
  background: disabled ? '#93c5fd' : '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const card: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #f1f5f9',
  borderRadius: 12,
  padding: '16px',
};

function money(value: number, currency: string) {
  const decimals = currency === 'UZS' || currency === 'KZT' ? 0 : 2;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Row({
  left,
  right,
  bold,
  muted,
}: {
  left: string;
  right: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: '#888' }}>{left}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: bold ? 700 : 500,
          color: muted ? '#888' : '#111',
        }}
      >
        {right}
      </span>
    </div>
  );
}

export default function Payout({ onToast, onSuccess }: PayoutProps) {
  const [step, setStep] = useState(1);

  // Шаг 1 — сумма и коридор
  const [sourceCurrency, setSourceCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [country, setCountry] = useState('UZ');
  const [method, setMethod] = useState<DeliveryMethod>('CARD');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);

  // Шаг 2 — получатель
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
  const [cardNumber, setCardNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [purpose, setPurpose] = useState('CONTRACTOR_PAYMENT');
  const [invoiceReference, setInvoiceReference] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PayoutRecord | null>(null);

  const numericAmount = Number(amount);

  // Котировка пересчитывается с задержкой, чтобы не дёргать API на каждый символ
  useEffect(() => {
    if (!numericAmount || numericAmount <= 0) {
      setQuote(null);
      setQuoteError('');
      return;
    }

    setQuoting(true);
    const timer = setTimeout(() => {
      getQuote({ sourceCurrency, sourceAmount: numericAmount, country, method })
        .then((res: any) => {
          setQuote(res.data);
          setQuoteError('');
        })
        .catch((err: any) => {
          setQuote(null);
          setQuoteError(err.response?.data?.message || 'Could not get a rate');
        })
        .finally(() => setQuoting(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [numericAmount, sourceCurrency, country, method]);

  const loadBeneficiaries = useCallback(() => {
    getBeneficiaries()
      .then((res: any) => setBeneficiaries(res.data))
      .catch(() => setBeneficiaries([]));
  }, []);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  // Пока платёж в пути — подтягиваем статус
  useEffect(() => {
    if (step !== 4 || !result || result.status === 'COMPLETED') return;

    const timer = setInterval(() => {
      getPayout(result.reference)
        .then((res: any) => setResult(res.data))
        .catch(() => {});
    }, 15000);

    return () => clearInterval(timer);
  }, [step, result]);

  const matching = beneficiaries.filter(
    (b) => b.country === country && b.deliveryMethod === method,
  );

  const handleSaveBeneficiary = async () => {
    setSubmitting(true);
    try {
      const res: any = await createBeneficiary({
        name: newName,
        type: newType,
        country,
        deliveryMethod: method,
        cardNumber: method === 'CARD' ? cardNumber : undefined,
        bankName: method === 'BANK' ? bankName : undefined,
        accountNumber: method === 'BANK' ? accountNumber : undefined,
        swiftCode: method === 'BANK' ? swiftCode : undefined,
      });
      setBeneficiaries((prev) => [res.data, ...prev]);
      setSelectedId(res.data.id);
      setAddingNew(false);
      setNewName('');
      setCardNumber('');
      setBankName('');
      setAccountNumber('');
      setSwiftCode('');
      onToast('Beneficiary saved', 'success');
    } catch (err: any) {
      onToast(err.response?.data?.message || 'Could not save beneficiary', 'error');
    }
    setSubmitting(false);
  };

  const handleSend = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const res: any = await createPayout({
        beneficiaryId: selectedId,
        sourceCurrency,
        sourceAmount: numericAmount,
        purpose,
        invoiceReference: invoiceReference || undefined,
      });
      setResult(res.data);
      setStep(4);
      onSuccess();
    } catch (err: any) {
      onToast(err.response?.data?.message || 'Payment failed', 'error');
    }
    setSubmitting(false);
  };

  const reset = () => {
    setStep(1);
    setAmount('');
    setQuote(null);
    setSelectedId(null);
    setInvoiceReference('');
    setResult(null);
  };

  const activeCountry = COUNTRIES.find((c) => c.code === country)!;

  return (
    <div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#111',
          margin: '0 0 4px',
          letterSpacing: -0.5,
        }}
      >
        Pay a contractor
      </h2>
      <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px' }}>
        Send money from your business account to Central Asia
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 4,
              background: s <= step ? '#2563eb' : '#e2e8f0',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* ШАГ 1 — сумма и коридор */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <label style={label}>You send</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ ...input, fontSize: 18, fontWeight: 600, padding: '14px 16px' }}
              />
              <select
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
                style={{
                  ...input,
                  width: 'auto',
                  padding: '14px 12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {SOURCE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={label}>Recipient is in</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c.code)}
                  style={{
                    flex: 1,
                    padding: '14px 12px',
                    borderRadius: 12,
                    border: '1.5px solid ' + (country === c.code ? '#111' : '#f1f5f9'),
                    background: country === c.code ? '#f8fafc' : '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#111',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 18, marginRight: 6 }}>{c.flag}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={label}>How they receive it</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(
                [
                  {
                    key: 'CARD' as DeliveryMethod,
                    title: `Card in ${activeCountry.currency}`,
                    desc: 'Visa Direct · up to 2 days · $50,000 limit',
                  },
                  {
                    key: 'BANK' as DeliveryMethod,
                    title: `Bank account in ${sourceCurrency}`,
                    desc: 'SWIFT · same day · no limit',
                  },
                ]
              ).map((m) => (
                <div
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    border: '1.5px solid ' + (method === m.key ? '#111' : '#f1f5f9'),
                    background: method === m.key ? '#f8fafc' : '#fff',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Котировка */}
          {quoteError && (
            <div
              style={{
                ...card,
                background: '#fef2f2',
                borderColor: '#fecaca',
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 13, color: '#b91c1c' }}>{quoteError}</span>
            </div>
          )}

          {quote && !quoteError && (
            <div
              style={{
                background: '#0f172a',
                borderRadius: 16,
                padding: '20px',
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  margin: '0 0 6px',
                }}
              >
                They receive
              </p>
              <h3
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 16px',
                  letterSpacing: -0.8,
                  opacity: quoting ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {money(quote.targetAmount, quote.targetCurrency)} {quote.targetCurrency}
              </h3>
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: 14,
                }}
              >
                {[
                  {
                    l: 'Rate',
                    r: `1 ${quote.sourceCurrency} = ${money(quote.quotedRate, quote.targetCurrency)} ${quote.targetCurrency}`,
                  },
                  { l: 'Transfer fee', r: `${quote.fixedFee} ${quote.sourceCurrency}` },
                  {
                    l: 'Total to pay',
                    r: `${money(quote.totalDebit, quote.sourceCurrency)} ${quote.sourceCurrency}`,
                  },
                  { l: 'Arrives via', r: quote.rail },
                ].map((row) => (
                  <div
                    key={row.l}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                      {row.l}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                      {row.r}
                    </span>
                  </div>
                ))}
              </div>
              {quote.rateIsStale && (
                <p
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                    margin: '8px 0 0',
                  }}
                >
                  Indicative rate — live pricing unavailable right now
                </p>
              )}
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!quote || !!quoteError}
            style={primaryButton(!quote || !!quoteError)}
          >
            Continue
          </button>
        </div>
      )}

      {/* ШАГ 2 — получатель */}
      {step === 2 && (
        <div>
          <label style={label}>Who are you paying?</label>

          {matching.length > 0 && !addingNew && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {matching.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    border: '1.5px solid ' + (selectedId === b.id ? '#111' : '#f1f5f9'),
                    background: selectedId === b.id ? '#f8fafc' : '#fff',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {b.deliveryMethod === 'CARD'
                        ? `Card ending ${b.cardLast4} · ${b.currency}`
                        : `${b.bankName || 'Bank account'} · ${b.currency}`}
                    </div>
                  </div>
                  {selectedId === b.id && (
                    <span style={{ marginLeft: 'auto', color: '#111', fontSize: 18 }}>
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!addingNew && (
            <button
              onClick={() => setAddingNew(true)}
              style={{
                width: '100%',
                padding: '13px',
                background: '#fff',
                border: '1.5px dashed #cbd5e1',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                color: '#2563eb',
                cursor: 'pointer',
                marginBottom: 20,
                fontFamily: 'inherit',
              }}
            >
              Add a new beneficiary
            </button>
          )}

          {addingNew && (
            <div style={{ ...card, marginBottom: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={label}>Full name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="As it appears on their account"
                  style={{ ...input, background: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={label}>They are</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['INDIVIDUAL', 'BUSINESS'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      style={{
                        flex: 1,
                        padding: '11px',
                        borderRadius: 10,
                        border: '1.5px solid ' + (newType === t ? '#111' : '#e2e8f0'),
                        background: newType === t ? '#111' : '#fff',
                        color: newType === t ? '#fff' : '#666',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t === 'INDIVIDUAL' ? 'A person' : 'A company'}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'CARD' ? (
                <div style={{ marginBottom: 14 }}>
                  <label style={label}>Card number</label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="8600 1234 5678 9012"
                    style={{ ...input, background: '#fff' }}
                  />
                  <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0' }}>
                    We store only the last four digits.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={label}>Bank name</label>
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. Kapitalbank"
                      style={{ ...input, background: '#fff' }}
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={label}>Account number</label>
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      style={{ ...input, background: '#fff' }}
                    />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={label}>SWIFT code</label>
                    <input
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value)}
                      placeholder="KAPCUZ22"
                      style={{ ...input, background: '#fff' }}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setAddingNew(false)}
                  style={{
                    padding: '12px 20px',
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBeneficiary}
                  disabled={submitting || !newName}
                  style={{
                    ...primaryButton(submitting || !newName),
                    flex: 1,
                    padding: '12px',
                  }}
                >
                  {submitting ? 'Saving…' : 'Save beneficiary'}
                </button>
              </div>
            </div>
          )}

          {!addingNew && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label style={label}>What is this payment for?</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={{ ...input, cursor: 'pointer' }}
                >
                  {PURPOSES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0' }}>
                  Banks ask for this. Getting it right keeps the payment moving.
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={label}>Invoice or contract number</label>
                <input
                  value={invoiceReference}
                  onChange={(e) => setInvoiceReference(e.target.value)}
                  placeholder="Optional, e.g. INV-2026-041"
                  style={input}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '14px 24px',
                    background: '#fff',
                    color: '#111',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedId}
                  style={{ ...primaryButton(!selectedId), flex: 1 }}
                >
                  Review payment
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ШАГ 3 — подтверждение */}
      {step === 3 && quote && (
        <div>
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12 }}>
              Payment details
            </div>
            <Row
              left="Beneficiary"
              right={beneficiaries.find((b) => b.id === selectedId)?.name || ''}
            />
            <Row left="Destination" right={quote.countryName} />
            <Row
              left="Purpose"
              right={PURPOSES.find((p) => p.value === purpose)?.label || ''}
            />
            {invoiceReference && <Row left="Reference" right={invoiceReference} />}
          </div>

          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12 }}>
              Amount
            </div>
            <Row
              left="You send"
              right={`${money(quote.sourceAmount, quote.sourceCurrency)} ${quote.sourceCurrency}`}
            />
            <Row
              left={`Rate (${quote.markupPercent}% above mid-market)`}
              right={`${money(quote.quotedRate, quote.targetCurrency)}`}
            />
            <Row left="Transfer fee" right={`${quote.fixedFee} ${quote.sourceCurrency}`} />
            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                marginTop: 4,
                paddingTop: 12,
              }}
            >
              <Row
                left="Total charged"
                right={`${money(quote.totalDebit, quote.sourceCurrency)} ${quote.sourceCurrency}`}
                bold
              />
              <Row
                left="They receive"
                right={`${money(quote.targetAmount, quote.targetCurrency)} ${quote.targetCurrency}`}
                bold
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#888', margin: '0 0 20px' }}>
            Expected to arrive within {quote.hoursToDeliver} hours via {quote.rail}.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: '14px 24px',
                background: '#fff',
                color: '#111',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Back
            </button>
            <button
              onClick={handleSend}
              disabled={submitting}
              style={{ ...primaryButton(submitting), flex: 1 }}
            >
              {submitting ? 'Sending…' : 'Send payment'}
            </button>
          </div>
        </div>
      )}

      {/* ШАГ 4 — статус */}
      {step === 4 && result && (
        <div>
          <div
            style={{
              background: '#0f172a',
              borderRadius: 16,
              padding: '24px 20px',
              marginBottom: 20,
            }}
          >
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px' }}>
              {result.beneficiary.name} receives
            </p>
            <h3
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                margin: '0 0 4px',
                letterSpacing: -0.8,
              }}
            >
              {money(Number(result.targetAmount), result.targetCurrency)}{' '}
              {result.targetCurrency}
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              {result.reference}
            </p>
          </div>

          <div style={{ ...card, marginBottom: 20 }}>
            {ALL_STATUSES.map((status, i) => {
              const event = result.statusHistory.find((e) => e.status === status);
              const done = !!event;
              const isCurrent = result.status === status;
              return (
                <div
                  key={status}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    paddingBottom: i === ALL_STATUSES.length - 1 ? 0 : 16,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: done ? '#0f172a' : '#fff',
                        border: '2px solid ' + (done ? '#0f172a' : '#cbd5e1'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {done ? '✓' : ''}
                    </div>
                    {i < ALL_STATUSES.length - 1 && (
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 24,
                          background: done ? '#0f172a' : '#e2e8f0',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ paddingTop: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: isCurrent ? 600 : 500,
                        color: done ? '#111' : '#94a3b8',
                      }}
                    >
                      {STATUS_LABELS[status]}
                    </div>
                    {event && (
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                        {event.note} ·{' '}
                        {new Date(event.at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {result.status !== 'COMPLETED' && result.estimatedDelivery && (
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>
              Expected by{' '}
              {new Date(result.estimatedDelivery).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              . This page updates on its own.
            </p>
          )}

          <button onClick={reset} style={primaryButton(false)}>
            Make another payment
          </button>
        </div>
      )}
    </div>
  );
}
