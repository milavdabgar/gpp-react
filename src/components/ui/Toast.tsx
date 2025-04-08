import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 flex items-center ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50`}>
      <span className="mr-2">{message}</span>
      <button onClick={onClose} className="hover:text-gray-200">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
