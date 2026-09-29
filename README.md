# Genesis App (packaged)

This is your project packaged as a standard Vite + React + TypeScript + Tailwind app.

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Notes / things changed from your pasted code

1. **Removed 3 private packages** from `package.json` that aren't published on the public npm registry
   (they were Taskade-internal): `@taskade/genesis-client`, `@taskade/parade-shared`,
   `@taskade/parade-template-utils`. Nothing in your pasted files actually imports them directly, so
   removing them doesn't break anything.
2. Replaced `"shiki": "^4.0.2"` with the `@shikijs/core` + `@shikijs/engine-javascript` +
   `@shikijs/themes` packages, since `src/lib/shiki.ts` (which you provided) imports those directly.
3. Added all the missing config/scaffold files needed to actually run the project:
   `vite.config.ts`, `tsconfig*.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`,
   `components.json`, `.gitignore`, `src/vite-env.d.ts`.
4. Left out a handful of files you pasted that nothing in the project actually imports, to keep the
   build small: `src/lib/genesis-auth.tsx`, `src/lib/leaflet-setup.ts`, and the legacy (non-v2)
   `src/lib/agent-chat/{client,hooks,stream,types}.ts`, plus a few unused shadcn/ui components
   (sidebar, sheet, drawer, calendar, menubar, navigation-menu, pagination, popover, radio-group,
   resizable, slider, sonner-toaster wrapper, switch, toggle, toggle-group, context-menu, kbd, item,
   field, input-otp). If you need any of these, tell me and I'll add them back in exactly as you
   pasted them.
5. Nothing else was changed — all component/logic code is exactly what you provided.

## AI Chat Widget (Update: now works standalone)

The original `FloatingAgentChat` block called a Taskade-only backend (`/api/taskade/...`), which
only works inside Taskade's own hosting. It's been replaced with:

- **`src/components/site/SimpleChatWidget.tsx`** — a small, self-contained floating chat button.
- **`api/chat.ts`** — a Vercel Edge Function that calls OpenAI (`gpt-4o-mini`) with a system
  prompt containing Tuli's resume info (skills, experience, education, etc.), so the assistant
  answers questions about her specifically instead of generically.

### To make the chatbot work after deploying to Vercel:

1. Get an API key from https://platform.openai.com/api-keys
2. In your Vercel project: **Settings → Environment Variables** → add
   `OPENAI_API_KEY` = `sk-...`
3. Redeploy (or it will pick it up on the next deploy).

That's it — the chat button will then answer questions about Tuli using the info baked into
`api/chat.ts`. To update what the bot knows (new job, new skill, etc.), edit the
`SYSTEM_PROMPT` constant at the top of `api/chat.ts` and redeploy.

### Local development

`npm run dev` (Vite) does **not** run the `/api` folder — that only works when deployed to
Vercel (or via `vercel dev` locally, if you have the Vercel CLI installed: `npm i -g vercel`,
then `vercel dev` instead of `npm run dev`). Running the site with plain `npm run dev` will
show the chat button, but sending a message will fail until either:
- you deploy to Vercel with the env var set, or
- you run `vercel dev` locally with a `.env` file containing `OPENAI_API_KEY=sk-...`

A `.env.example` file is included — copy it to `.env` and fill in your real key:
```bash
cp .env.example .env
# then edit .env and paste your real OPENAI_API_KEY
vercel dev
```
`.env` is already listed in `.gitignore` so your real key won't get committed.

### Cost note

Every message sent through the widget calls the OpenAI API and costs a small amount of money
based on your OpenAI plan/usage. `gpt-4o-mini` is the cheapest capable model, but it isn't free
per-call — only the initial signup credit (if any) is free.
