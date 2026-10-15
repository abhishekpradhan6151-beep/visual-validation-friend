# FRAME — AI integration design (Phase 2)

Status: **not connected**. Phase 1 uses `src/lib/frame/mock-generator.ts` via `src/lib/frame/ai-service.ts`.

## Boundary
- UI only imports `ai-service.ts` (`generatePackage`, `regenerateSection`, `editPackage`).
- Phase 2 replaces the mock `AIProvider` with one that calls a TanStack `createServerFn` (runs server-side). The browser never calls a model provider.

## Server function
- Secret (e.g. `LOVABLE_API_KEY`) read from `process.env` inside the handler only. Never `VITE_*`.
- Validate input with zod: idea 8–500 chars, instruction ≤ 300 chars, enum platform/language/tone/duration.
- Request structured output (tool calling) matching `ContentPackage` in `types.ts`; parse with zod, reject malformed output.
- Cap output tokens; 20s timeout via `AbortController`.
- Map errors: 429 → `rate_limited`, 402/5xx → `provider`, abort → `timeout`, schema failure → `provider` (retry once).
- Edits send the current package + instruction and must return only changed sections (`changed: SectionKey[]`).

## Before public launch
- Require sign-in (auth middleware) and store creations in the database instead of localStorage.
- Per-user daily usage limits enforced server-side.
