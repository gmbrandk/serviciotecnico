import toast from 'react-hot-toast';
import {
  canAddToast,
  removeOldestToastIfNeeded,
  registerToast
} from './toastLimiter';

export const showToast = (mensaje, tipo = 'error') => {
  removeOldestToastIfNeeded();

  const id = toast[tipo](mensaje, {
    id: `toast-${Date.now()}-${Math.random()}`
  });

  registerToast(id);
};
