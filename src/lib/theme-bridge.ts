const THEME_STYLE_ID = 'taskade-theme-overrides';

function parseHsl(hsl: string): { h: number; s: number; l: number } | null {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return null;
  const h = parseFloat(parts[0]!);
  const s = parseFloat(parts[1]!);
  const l = parseFloat(parts[2]!);
  if (isNaN(h) || isNaN(s) || isNaN(l)) return null;
  return { h, s, l };
}

function deriveDarkValue(key: string, hsl: string): string {
  const parsed = parseHsl(hsl);
  if (parsed == null) return hsl;
  const { h, s, l } = parsed;

  if (key === '--radius') return hsl;

  let darkL: number;
  let darkS = s;

  if (['--background', '--card', '--popover'].includes(key)) {
    darkL = Math.max(3, Math.min(8, 100 - l));
  } else if (
    ['--foreground', '--card-foreground', '--popover-foreground'].includes(key)
  ) {
    darkL = Math.min(95, Math.max(85, 100 - l));
  } else if (key === '--primary') {
    darkL = l <= 50 ? Math.min(98, 100 - l) : Math.max(2, 100 - l);
  } else if (key === '--primary-foreground') {
    darkL = l > 50 ? Math.max(2, 100 - l) : Math.min(98, 100 - l);
  } else if (
    ['--accent', '--muted', '--border', '--input', '--ring'].includes(key)
  ) {
    darkL = Math.max(10, Math.min(20, 100 - l));
    darkS = Math.min(s, 50);
  } else if (key === '--accent-foreground' || key === '--muted-foreground') {
    darkL = Math.min(98, Math.max(55, 100 - l));
  } else if (
    key === '--secondary' ||
    key === '--secondary-foreground'
  ) {
    darkL = l > 50 ? Math.max(8, 100 - l) : Math.min(98, 100 - l);
  } else if (key === '--destructive') {
    darkL = Math.max(25, l * 0.65);
    darkS = Math.min(s, 70);
  } else if (key === '--destructive-foreground') {
    darkL = Math.min(98, Math.max(90, 100 - l));
  } else {
    darkL = 100 - l;
  }

  return `${h} ${darkS}% ${Math.round(darkL)}%`;
}

function buildCssBlock(
  selector: string,
  vars: Record<string, string>,
): string {
  const declarations = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  return `${selector} {\n${declarations}\n}`;
}

export function setupThemeBridge() {
  const appliedKeys = new Set<string>();
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return;

    if (event.data?.type === 'TASKADE_THEME_UPDATE') {
      const vars: Record<string, string> | undefined = event.data.data?.vars;
      if (vars == null) return;

      const previousKeys = new Set(appliedKeys);

      const lightVars: Record<string, string> = {};
      const darkVars: Record<string, string> = {};

      appliedKeys.clear();

      for (const [key, value] of Object.entries(vars)) {
        if (value === '') continue;
        lightVars[key] = value;
        darkVars[key] = deriveDarkValue(key, value);
        appliedKeys.add(key);
      }

      for (const key of previousKeys) {
        document.documentElement.style.removeProperty(key);
      }

      let styleEl = document.getElementById(
        THEME_STYLE_ID,
      ) as HTMLStyleElement | null;

      if (Object.keys(lightVars).length === 0) {
        styleEl?.remove();
      } else {
        if (styleEl == null) {
          styleEl = document.createElement('style');
          styleEl.id = THEME_STYLE_ID;
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = [
          buildCssBlock(':root', lightVars),
          buildCssBlock('.dark', darkVars),
        ].join('\n\n');
      }

      window.parent.postMessage({ type: 'TASKADE_THEME_APPLIED' }, '*');
      return;
    }

    if (event.data?.type === 'TASKADE_THEME_READ') {
      const keys: string[] | undefined = event.data.data?.keys;
      if (keys == null) return;

      const computed = getComputedStyle(document.documentElement);
      const vars: Record<string, string> = {};
      for (const key of keys) {
        const val = computed.getPropertyValue(key).trim();
        if (val) vars[key] = val;
      }

      window.parent.postMessage(
        { type: 'TASKADE_THEME_CURRENT', data: { vars } },
        '*',
      );
      return;
    }
  });
}
