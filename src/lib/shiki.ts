import type { HighlighterCore } from "@shikijs/core";
import { createHighlighterCore } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import githubDark from "@shikijs/themes/github-dark";
import githubLight from "@shikijs/themes/github-light";

export type { ThemedToken } from "@shikijs/core";

export type BundledLanguage = string;

const SHIKI_CDN_BASE = "https://esm.sh/@shikijs/langs@4.0.2/";

let highlighterPromise: Promise<HighlighterCore> | null = null;

function getOrCreateHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubLight, githubDark],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

const loadedLangs = new Set<string>();
const loadingLangs = new Map<string, Promise<void>>();

async function ensureLanguage(
  highlighter: HighlighterCore,
  lang: string
): Promise<void> {
  if (loadedLangs.has(lang)) return;

  const existing = loadingLangs.get(lang);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const mod = await import(/* @vite-ignore */ `${SHIKI_CDN_BASE}${lang}.mjs`);
      await highlighter.loadLanguage(mod.default ?? mod);
    } catch {
      // Language not available on CDN — falls back to plaintext
    } finally {
      loadedLangs.add(lang);
      loadingLangs.delete(lang);
    }
  })();

  loadingLangs.set(lang, promise);
  return promise;
}

export async function getHighlighter(
  language: string
): Promise<HighlighterCore> {
  const highlighter = await getOrCreateHighlighter();
  await ensureLanguage(highlighter, language);
  return highlighter;
}
