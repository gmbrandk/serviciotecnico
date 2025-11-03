// src/services/toast/toastService.js
import Toast from '@components/shared/Toast';
import { toast } from 'react-hot-toast';
import { registerToast, removeOldestToastIfNeeded } from './toastLimiter';

export const showToast = (type, title, message, duration = 3000) => {
  removeOldestToastIfNeeded();

  const id = toast.custom(
    (t) => (
      <Toast
        t={t}
        type={type}
        title={title}
        message={message}
        onClose={() => toast.dismiss(t.id)}
      />
    ),
    {
      id: `toast-${Date.now()}-${Math.random()}`,
      duration,
      position: 'top-right',
    }
  );

  registerToast(id);
};
