# Error History

Log bugs, incidents, and fixes so the same issues are not re-debugged from scratch.

| Date | Symptom | Root cause | Fix | Prevention |
|------|---------|------------|-----|------------|
| 2026-06-14 | `npx tailwindcss init -p` failed | Tailwind v4 installed by default; v4 CLI differs from v3 `init` | Pinned `tailwindcss@3` and created config files manually | Use `tailwindcss@3` when following classic `tailwind.config.js` + `@tailwind` setup |
| 2026-06-14 | PowerShell `&&` chain failed | Older PowerShell does not support `&&` | Use `;` to separate commands on Windows | Prefer `;` or run commands individually in PowerShell |
| 2026-06-14 | `npm run dev` SecurityError in PowerShell | Execution policy blocks `npm.ps1` | Use `npm.cmd`, `.\dev.cmd`, or Command Prompt terminal | `.vscode/settings.json` sets default terminal to cmd; see `dev.cmd` / `build.cmd` |

## Template (copy for new entries)

```markdown
| YYYY-MM-DD | What the user saw | Why it happened | What we changed | How to avoid next time |
```

## Known risks (not yet errors)

- **Open RLS policies** — anon role can read/write all rows; security relies entirely on app-side `device_id` filtering.
- **No auth** — clearing localStorage creates a new `device_id` and effectively orphans prior data from the user’s perspective.
