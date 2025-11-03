// utils/useRenderLogger.js
import { useEffect } from 'react';
import { logRender } from './renderLogger';

export function useRenderLogger(name) {
  useEffect(() => {
    logRender(name);
  });
}
