const MERMAID_VERSION = "11.14.0";
const MERMAID_CDN_URL = `https://esm.sh/mermaid@${MERMAID_VERSION}`;

interface MermaidConfig {
  startOnLoad?: boolean;
  theme?: string;
  securityLevel?: string;
  fontFamily?: string;
  suppressErrorRendering?: boolean;
  [key: string]: unknown;
}

interface MermaidInstance {
  initialize: (config: MermaidConfig) => void;
  render: (id: string, source: string) => Promise<{ svg: string }>;
}

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: "default",
  securityLevel: "strict",
  fontFamily: "monospace",
  suppressErrorRendering: true,
};

let mermaidModulePromise: Promise<{ default: MermaidInstance }> | null = null;
let initialized = false;

function getMermaidModule(): Promise<{ default: MermaidInstance }> {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import(/* @vite-ignore */ MERMAID_CDN_URL) as Promise<{
      default: MermaidInstance;
    }>;
  }
  return mermaidModulePromise;
}

export const mermaid = {
  name: "mermaid" as const,
  type: "diagram" as const,
  language: "mermaid",

  getMermaid(config?: MermaidConfig): MermaidInstance {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    return {
      initialize(overrides: MermaidConfig) {
        Object.assign(mergedConfig, overrides);
        initialized = false;
      },

      async render(id: string, source: string): Promise<{ svg: string }> {
        const mod = await getMermaidModule();
        const m = mod.default;

        if (!initialized) {
          m.initialize(mergedConfig);
          initialized = true;
        }

        return m.render(id, source);
      },
    };
  },
};
