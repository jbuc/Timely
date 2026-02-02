import { useEffect, ReactNode } from 'react';
import { useActiveTheme } from '../store';
import { ThemeConfig } from '../types';

interface ThemeProviderProps {
  children: ReactNode;
}

function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;

  // Apply CSS custom properties
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-surface-elevated', theme.colors.surfaceElevated);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-muted', theme.colors.textMuted);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-error', theme.colors.error);

  // Apply color scheme for system UI elements
  root.style.colorScheme = theme.isDark ? 'dark' : 'light';

  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.colors.background);
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useActiveTheme();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
}

// Hook to get CSS variable value
export function useCssVar(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
