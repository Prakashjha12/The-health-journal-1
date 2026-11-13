# Plan 001: Establish Testing & Verification Baseline

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ea77466..HEAD -- package.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests / dx
- **Planned at**: commit `ea77466`, 2026-11-13

## Why this matters

The repository currently has zero test files and no `test` or `typecheck` commands defined in `package.json`. While `tsc --noEmit` runs cleanly, an executor or developer has no automated way to ensure that refactoring data fetching, state handling, or utility functions does not break core business logic. Establishing a fast, lightweight unit test runner (Vitest) and standardized verification scripts provides the bedrock verification gates required for all subsequent plans.

## Current state

- `package.json` — currently defines only dev, build, start, lint, and clerk:set-superuser scripts:
```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "clerk:set-superuser": "node scripts/clerk-set-super-user.mjs docofphysio"
  },
```
- `src/lib/utils.ts` — contains pure utility functions including `calculateReadingTime` and `cn`:
```typescript
export function calculateReadingTime(body: Block[] | unknown[] | undefined): number {
  if (!body) return 1
  let wordCount = 0
  for (const block of body as Block[]) {
    if (block._type === 'block' && block.children) {
      for (const child of block.children) {
        if (child.text) {
          wordCount += child.text.split(/\s+/).filter(Boolean).length
        }
      }
    }
  }
  return Math.max(1, Math.ceil(wordCount / 200))
}
```
- No testing dependencies (`vitest`, `@testing-library/react`, etc.) are installed.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `pnpm install`           | exit 0              |
| Typecheck | `pnpm typecheck`         | exit 0, no errors   |
| Tests     | `pnpm test`              | exit 0, all pass    |
| Lint      | `pnpm run lint`          | exit 0              |

## Scope

**In scope**:
- `package.json`
- `vitest.config.mts` (create)
- `src/lib/utils.test.ts` (create)

**Out of scope**:
- End-to-end testing frameworks (Playwright, Cypress)
- Modifying Next.js runtime configurations (`next.config.ts`, `globals.css`)
- Modifying React components in `src/components/`

## Git workflow

- Branch: `advisor/001-verification-baseline`
- Commit style: conventional commit, e.g. `test: add vitest runner and baseline utils unit tests`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add Vitest development dependencies and scripts to `package.json`

Add `"vitest": "^3.0.0"` (or latest compatible v3) to `devDependencies` in `package.json`. Add the following scripts to `package.json`:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "clerk:set-superuser": "node scripts/clerk-set-super-user.mjs docofphysio"
}
```

Run install:
```bash
pnpm install
```

**Verify**: `pnpm typecheck` → exit 0

### Step 2: Create `vitest.config.mts` in project root

Create `vitest.config.mts` with TypeScript path alias resolution pointing `@/*` to `./src/*`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Verify**: `pnpm test` → exits cleanly (or warns no test files yet)

### Step 3: Create unit tests for `src/lib/utils.ts` in `src/lib/utils.test.ts`

Cover:
1. `calculateReadingTime` with undefined / null / empty array (returns minimum 1 min).
2. `calculateReadingTime` with short text (e.g., 50 words -> 1 min).
3. `calculateReadingTime` with longer text (e.g., 450 words -> 3 min).
4. `calculateReadingTime` ignoring non-block elements or blocks without children text.
5. `cn` class concatenation and merge behavior.

```typescript
import { describe, it, expect } from 'vitest'
import { calculateReadingTime, cn } from './utils'

describe('calculateReadingTime', () => {
  it('returns 1 for empty or missing body', () => {
    expect(calculateReadingTime(undefined)).toBe(1)
    expect(calculateReadingTime([])).toBe(1)
  })

  it('calculates reading time at approximately 200 words per minute', () => {
    const text200Words = Array(200).fill('health').join(' ')
    const body = [
      {
        _type: 'block',
        children: [{ text: text200Words }],
      },
    ]
    expect(calculateReadingTime(body)).toBe(1)

    const text500Words = Array(500).fill('medical').join(' ')
    const longBody = [
      {
        _type: 'block',
        children: [{ text: text500Words }],
      },
    ]
    expect(calculateReadingTime(longBody)).toBe(3)
  })

  it('safely handles non-block elements', () => {
    const mixedBody = [
      { _type: 'image', asset: {} },
      { _type: 'block', children: [{ text: 'Hello world' }] },
    ]
    expect(calculateReadingTime(mixedBody)).toBe(1)
  })
})

describe('cn', () => {
  it('combines class names and merges tailwind conflicts', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', false && 'text-blue-500', undefined)).toBe('text-red-500')
  })
})
```

**Verify**: `pnpm test` → all tests pass (exit 0)

## Test plan

- Test coverage: `src/lib/utils.ts`
- Verification command: `pnpm test`
- Expected: 1 test file passes, 4+ assertions pass.

## Done criteria

- [ ] `pnpm typecheck` exits 0 with no errors.
- [ ] `pnpm test` exits 0 with all tests passing.
- [ ] `pnpm run lint` exits 0.
- [ ] Only `package.json`, `pnpm-lock.yaml`, `vitest.config.mts`, and `src/lib/utils.test.ts` are touched.

## STOP conditions

- If Vitest causes an unresolvable dependency clash with Next 16 or React 19, stop and report.
- If existing TypeScript configurations fail under Vitest's loader, stop and report.

## Maintenance notes

- Future plans can add test files matching `*.test.ts` or `*.test.tsx` adjacent to the tested unit.
- If React component DOM testing is needed in the future, add `@testing-library/react` and `happy-dom`.

