import toast from 'react-hot-toast';
let toastIds = [];

export const canAddToast = () => toastIds.length < 2;

export const registerToast = (id) => {
  toastIds.push(id);
  setTimeout(() => {
    toastIds = toastIds.filter((t) => t !== id);
  }, 3000); // Igual a duración
};

export const removeOldestToastIfNeeded = () => {
  if (toastIds.length >= 2) {
    const idToRemove = toastIds.shift();
    toast.dismiss(idToRemove);
  }
};
