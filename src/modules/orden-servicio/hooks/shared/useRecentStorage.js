import { useState } from 'react';

export function useRecentStorage(key, limit = 5) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  });

  const addItem = (item) => {
    const updated = [item, ...items.filter((i) => i.dni !== item.dni)].slice(
      0,
      limit
    );
    setItems(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  return { items, addItem };
}
