import { useState } from 'react';

interface Toast {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Toast) => {
    setToasts((currentToasts) => [...currentToasts, newToast]);
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.slice(1));
    }, 3000);
  };

  return { toast, toasts };
};
