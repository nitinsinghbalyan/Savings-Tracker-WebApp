<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This repo is a single Next.js 16 web app (RupeeRise) backed by a **local Supabase stack** (Postgres + Auth) that runs in Docker. Standard scripts (`npm run dev|build|lint`) are in `package.json`; setup details are in `README.md`. The `npm install` dependency refresh runs automatically on VM startup — the notes below are the non-obvious bits.

### Starting the app (services are NOT auto-started)
Run these in order from `/workspace`:
1. **Docker daemon** (needs sudo; the daemon socket is root-owned): `sudo dockerd` in a background/tmux session. It uses `fuse-overlayfs` with the containerd snapshotter disabled (`/etc/docker/daemon.json`) — required for Docker-in-Docker here.
2. **Supabase stack**: `sudo supabase start` (run with sudo so it can reach the root-owned Docker socket). This applies `supabase/migrations/*` then `supabase/seed.sql`. Get keys anytime with `sudo supabase status`.
3. **`.env.local`** (git-ignored, so recreate it if missing) — the local Supabase URL and anon key are fixed defaults:
   - `NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"`
   - `NEXT_PUBLIC_APP_URL="http://localhost:3000"`
   - Env is validated at startup (`src/lib/env.ts` + `src/instrumentation.ts`); the dev server refuses to boot without valid values.
4. **Dev server**: `npm run dev` → http://localhost:3000 (unauthenticated users are redirected to `/auth/login`).

### Non-obvious gotchas
- **`supabase/seed.sql` is required, not optional.** The bundled local Postgres only grants `Dxtm` (not `SELECT/INSERT/UPDATE/DELETE`) to `anon`/`authenticated` on the `public` schema by default, unlike hosted Supabase. The seed re-grants full DML (RLS still enforces per-user access). Without it, all data writes fail with `permission denied for table savings_plans`. The seed auto-runs on `supabase start` (fresh volume) and every `supabase db reset`.
- The `supabase` CLI is a shim that needs its `supabase-go` sibling on PATH; both live in `/usr/local/lib/supabase` and are symlinked into `/usr/local/bin`. Don't move one without the other.
- Email confirmations are disabled locally (`[auth.email] enable_confirmations = false` in `supabase/config.toml`), so signing up logs you straight into `/dashboard` — no email step.
- Studio UI is at http://127.0.0.1:54323; sent emails (if enabled) appear in Mailpit at http://127.0.0.1:54324.
