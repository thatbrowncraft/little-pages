import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#4E5B3D] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-[#8C5245] shrink-0" />,
    info: <Info className="w-4 h-4 text-[#4A5D6E] shrink-0" />,
  };

  const borderColors = {
    success: 'border-[#9EB384]',
    error: 'border-[#E59A9A]',
    info: 'border-[#7D8F9F]',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between p-3.5 bg-[#FFFDF9] text-[#3E2723] rounded-lg border shadow-md font-sans text-xs transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
        borderColors[toast.type]
      }`}
      style={{ boxShadow: '0 4px 12px rgba(62,39,35,0.08)' }}
    >
      <div className="flex items-center space-x-2.5 mr-2">
        {icons[toast.type]}
        <span className="font-medium leading-tight">{toast.text}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#8C7B6A] hover:text-[#3E2723] p-1 rounded transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
