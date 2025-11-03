// utils/useRenderCount.js
import { useEffect, useRef } from 'react';

export function useRenderCount(componentName) {
  const count = useRef(1);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} render #${count.current}`);
    }
    count.current++;
  });
}
