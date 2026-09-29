import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const next = useNextTheme();
  const isDark = (next.resolvedTheme ?? next.theme) === 'dark';
  const toggle = () => next.setTheme(isDark ? 'light' : 'dark');
  return { ...next, isDark, toggle };
}
