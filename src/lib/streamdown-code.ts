import type { HighlighterCore } from "@shikijs/core";
import { getHighlighter } from "./shiki";

const THEMES = ["github-light", "github-dark"] as const;

const cache = new Map<string, { bg?: string; fg?: string; tokens: any[][] }>();
const subscribers = new Map<
  string,
  Set<(result: { bg?: string; fg?: string; tokens: any[][] }) => void>
>();

function cacheKey(code: string, language: string, themes: [string, string]): string {
  const start = code.slice(0, 100);
  const end = code.length > 100 ? code.slice(-100) : "";
  return `${language}:${themes[0]}:${themes[1]}:${code.length}:${start}:${end}`;
}

function themeNames(themes: [unknown, unknown]): [string, string] {
  const name = (t: unknown) =>
    typeof t === "string" ? t : (t as { name?: string })?.name ?? "custom";
  return [name(themes[0]), name(themes[1])];
}

export const code = {
  name: "shiki" as const,
  type: "code-highlighter" as const,

  supportsLanguage(_language: string): boolean {
    return true;
  },

  getSupportedLanguages(): string[] {
    return [];
  },

  getThemes(): [string, string] {
    return [THEMES[0], THEMES[1]];
  },

  highlight(
    options: { code: string; language: string; themes: [unknown, unknown] },
    callback?: (result: { bg?: string; fg?: string; tokens: any[][] }) => void
  ): { bg?: string; fg?: string; tokens: any[][] } | null {
    const { code: src, language } = options;
    const names = themeNames(options.themes);
    const key = cacheKey(src, language, names);

    const cached = cache.get(key);
    if (cached) return cached;

    if (callback) {
      if (!subscribers.has(key)) {
        subscribers.set(key, new Set());
      }
      subscribers.get(key)!.add(callback);
    }

    getHighlighter(language)
      .then((highlighter: HighlighterCore) => {
        const langToUse = highlighter.getLoadedLanguages().includes(language)
          ? language
          : "text";

        const result = highlighter.codeToTokens(src, {
          lang: langToUse,
          themes: { light: names[0], dark: names[1] },
        });

        const tokenized = {
          bg: result.bg ?? undefined,
          fg: result.fg ?? undefined,
          tokens: result.tokens as any[][],
        };

        cache.set(key, tokenized);

        const subs = subscribers.get(key);
        if (subs) {
          for (const sub of subs) {
            sub(tokenized);
          }
          subscribers.delete(key);
        }
      })
      .catch((error: unknown) => {
        console.error("[streamdown-code] Failed to highlight:", error);
        subscribers.delete(key);
      });

    return null;
  },
};
