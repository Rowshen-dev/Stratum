import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      zIndex: 9999,
      background: type === 'success' ? '#2bbf5c' : '#c0392b',
      color: 'white',
      padding: '14px 22px',
      borderRadius: 14,
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      animation: 'slideIn 0.3s ease',
    }}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      {message}
      <span
        onClick={onClose}
        style={{ marginLeft: 8, cursor: 'pointer', opacity: 0.7 }}
      >✕</span>
    </div>
  );
}
