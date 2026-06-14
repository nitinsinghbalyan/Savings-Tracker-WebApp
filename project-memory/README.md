# Project Memory

Persistent context for the **savings-tracker** app. Use this folder so agents and contributors can pick up where the last session left off.

## Files

| File | Purpose |
|------|---------|
| [srs.md](./srs.md) | Software requirements — scope, users, constraints |
| [features.md](./features.md) | Feature list with status and notes |
| [architecture.md](./architecture.md) | Stack, schema, folder layout, env vars |
| [test-cases.md](./test-cases.md) | Manual and automated test checklist |
| [error-history.md](./error-history.md) | Bugs, fixes, and lessons learned |
| [decisions.md](./decisions.md) | Architecture and product decision log |
| [changelog.md](./changelog.md) | Notable changes by date |

## Update policy

- **Append** new entries; do not delete historical rows unless factually wrong.
- Bump **Last updated** dates when editing a file.
- Mark superseded items with a note rather than removing them.

## How to use

1. **Before starting work** — skim `features.md`, `architecture.md`, and recent `error-history.md` entries.
2. **After shipping a feature** — update `features.md` and `changelog.md`.
3. **After fixing a bug** — add a row to `error-history.md`.
4. **After a design choice** — log it in `decisions.md`.

## Conventions

- Dates: `YYYY-MM-DD`
- Feature status: `planned` · `in-progress` · `done` · `deferred`
- Test result: `pass` · `fail` · `blocked` · `not-run`
