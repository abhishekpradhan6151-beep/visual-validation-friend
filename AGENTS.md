<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- UI calls AI only through `src/lib/frame/ai-service.ts`; provider code stays isolated (swap mock for server function later). See docs/ai-integration.md.
- Phase 1 persistence is localStorage (`src/lib/frame/storage.ts`) — no backend until needed.
