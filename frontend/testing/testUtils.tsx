import React from 'react';
import { render, RenderOptions, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../contexts/ThemeContext';

/**
 * Custom render function that wraps components with necessary providers
 * and waits for ThemeContext to be ready
 */
export async function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  const result = render(ui, { wrapper: Wrapper, ...options });
  
  // Wait a tick for ThemeContext to load from AsyncStorage
  await waitFor(() => {}, { timeout: 100 }).catch(() => {});
  
  return result;
}

// Re-export everything from testing-library
export * from '@testing-library/react-native';
