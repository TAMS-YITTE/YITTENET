import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} color="#10B981" />,
  error: <AlertCircle size={18} color="#EF4444" />,
  info: <Info size={18} color="#3B82F6" />,
};

const bgColors = {
  success: 'rgba(16, 185, 129, 0.1)',
  error: 'rgba(239, 68, 68, 0.1)',
  info: 'rgba(59, 130, 246, 0.1)',
};

const borderColors = {
  success: 'rgba(16, 185, 129, 0.3)',
  error: 'rgba(239, 68, 68, 0.3)',
  info: 'rgba(59, 130, 246, 0.3)',
};

const textColors = {
  success: '#065F46',
  error: '#991B1B',
  info: '#1E40AF',
};

const Toast = ({ id, type = 'info', message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.25rem',
      borderRadius: '8px',
      backgroundColor: bgColors[type],
      border: `1px solid ${borderColors[type]}`,
      color: textColors[type],
      fontSize: '0.9rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      pointerEvents: 'auto',
      minWidth: '280px',
      maxWidth: '420px',
    }}>
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => onDismiss(id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', opacity: 0.6 }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;