# Plan 005: Scope Link Word-Breaking Away From Site-Wide Anchor Tags

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ea77466..HEAD -- src/app/globals.css`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: styling / tech-debt
- **Planned at**: commit `ea77466`, 2026-11-13

## Why this matters

In `src/app/globals.css:160-163`, a global selector applies `word-break: break-all;` to all `<a>` tags across the entire application. While `overflow-wrap: anywhere` gracefully handles long unbroken tokens (such as URLs), `word-break: break-all` aggressively breaks words mid-letter at line boundaries regardless of whether the word fits on the next line. This causes standard navigation items ("Articles", "Sanity Dashboard"), buttons, and card titles to split awkwardly (e.g. "Arti-cles", "Dash-board") on mobile viewports.

## Current state

- `src/app/globals.css:159-163`:
```css
.prose a,
a {
  overflow-wrap: anywhere;
  word-break: break-all;
}
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `pnpm typecheck`         | exit 0, no errors   |
| Tests     | `pnpm test`              | exit 0, all pass    |
| Lint      | `pnpm run lint`          | exit 0              |

## Scope

**In scope**:
- `src/app/globals.css`

**Out of scope**:
- Any JSX component files

## Git workflow

- Branch: `advisor/005-fix-global-link-wrapping`
- Commit style: `style: remove aggressive word-break break-all from site-wide anchor tags`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Remove global `a { word-break: break-all; }` in `src/app/globals.css`

Modify `src/app/globals.css:159-163` so that `overflow-wrap: anywhere` is preserved to prevent horizontal overflow, but `word-break: break-all` is restricted only to explicit break classes or long prose links:

```css
/* ─── Prose & Link URL wrapping for mobile ─── */
.prose {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.prose a {
  overflow-wrap: anywhere;
  word-break: normal;
}

a {
  overflow-wrap: anywhere;
}
```

**Verify**: `pnpm run lint` → exit 0

## Test plan

- Run `pnpm test` → all tests pass.
- Run `pnpm run lint` → exit 0.

## Done criteria

- [ ] `a { word-break: break-all; }` no longer exists in `src/app/globals.css`.
- [ ] `pnpm run lint` exits 0.

## STOP conditions

- If any layout regressions occur on mobile navigation drawers, stop and report.

## Maintenance notes

- If a specific component renders a long, raw URL as an anchor, apply the Tailwind utility class `break-all` directly to that specific element rather than styling the global `<a>` tag.

