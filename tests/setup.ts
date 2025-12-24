import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// 1. Mock ResizeObserver (Used by TrayGroup)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// 2. Mock Canvas getContext (Used by measureTextWidth)
// JSDOM doesn't implement layout/rendering, so we mock the measureText function
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === '2d') {
    return {
      font: '',
      measureText: (text: string) => ({
        // Return a fake width based on string length to allow logic testing
        width: text.length * 10, 
      }),
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
}) as any;

// 3. Mock window.matchMedia (Used for responsive checks)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 4. Suppress specific console warnings if necessary
// console.warn = vi.fn();
