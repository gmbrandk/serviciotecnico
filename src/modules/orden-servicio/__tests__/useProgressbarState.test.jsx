import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProgressbarState } from '../useProgressBarState';

describe('useProgressbarState', () => {
  beforeEach(() => {
    // Restauramos mock de matchMedia entre tests
    window.matchMedia = vi.fn().mockImplementation((query) => {
      return {
        matches: false, // default
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    });
  });

  it('devuelve estados normales cuando reduce-motion está desactivado', () => {
    // mock: reduce-motion = false
    window.matchMedia.mockReturnValue({ matches: false });

    const { result, rerender } = renderHook(
      ({ step, total }) => useProgressbarState(step, total),
      { initialProps: { step: 0, total: 3 } }
    );

    expect(result.current).toEqual(['active', 'idle', 'idle']);

    rerender({ step: 1, total: 3 });
    expect(result.current).toEqual(['completed', 'active', 'idle']);
  });

  it('devuelve estados directos sin animación cuando reduce-motion está activado', () => {
    // mock: reduce-motion = true
    window.matchMedia.mockReturnValue({ matches: true });

    const { result, rerender } = renderHook(
      ({ step, total }) => useProgressbarState(step, total),
      { initialProps: { step: 0, total: 3 } }
    );

    expect(result.current).toEqual(['active', 'idle', 'idle']);

    rerender({ step: 2, total: 3 });
    expect(result.current).toEqual(['completed', 'completed', 'active']);
  });
});
